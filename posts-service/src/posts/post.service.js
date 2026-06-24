import Post from "./post.model.js";

// Crear publicación
export const createPostRecord = async ({ postData, authorId, image = null, attachments = [] }) => {
  const data = {
    ...postData,
    authorId,
    image,
    attachments,
    flaggedCount: 0,
    isPublished: postData.isPublished ?? true,
    moderation: postData.moderation,
  };

  const post = new Post(data);
  await post.save();
  return post;
};

// Listar publicaciones con paginación y filtros opcionales
export const fetchPosts = async ({ page = 1, limit = 10, category, onlyPublished = true }) => {
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (onlyPublished) filter.isPublished = true;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const posts = await Post.find(filter)
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Obtener posts dentro de un rango de distancia (en metros)
export const fetchPostsByProximity = async ({ latitude, longitude, maxDistance = 2000, category, onlyPublished = true }) => {
  const filter = {
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lng, lat] en GeoJSON
        },
        $maxDistance: maxDistance, // en metros
      },
    },
  };

  if (category) filter.category = category;
  if (onlyPublished) filter.isPublished = true;

  // Obtener posts con información de distancia
  const posts = await Post.find(filter).sort({ createdAt: -1 });

  // Calcular distancia para cada post y ordenar por distancia
  const postsWithDistance = posts.map(post => {
    const postLng = post.location.coordinates[0];
    const postLat = post.location.coordinates[1];

    // Calcular distancia aproximada usando fórmula de Haversine (en metros)
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (postLat - latitude) * Math.PI / 180;
    const dLng = (postLng - longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latitude * Math.PI / 180) * Math.cos(postLat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      ...post.toObject(),
      distance: Math.round(distance), // Distancia en metros, redondeada
    };
  });

  // Ordenar por distancia ascendente (más cercanos primero)
  postsWithDistance.sort((a, b) => a.distance - b.distance);

  return {
    posts: postsWithDistance,
    count: postsWithDistance.length,
  };
};

// Obtener publicación por ID
export const fetchPostById = async (id) => {
  return Post.findById(id).populate("authorId", "username email");
};

// Actualizar publicación (solo autor)
export const updatePostRecord = async ({ id, updateData, authorId, image, attachments }) => {
  const post = await Post.findById(id);
  if (!post) return null;

  // Verificar que es el autor (si se está editando contenido)
  if (updateData && (updateData.title || updateData.text || updateData.category) && post.authorId !== authorId) {
    throw new Error('No tienes permisos para editar esta publicación');
  }

  // Si viene imagen nueva, reemplazarla
  if (image) {
    post.image = image;
  }

  // Si vienen adjuntos nuevos, concatenarlos
  if (attachments && attachments.length) {
    post.attachments = [...(post.attachments || []), ...attachments];
  }

  // Aplicar actualizaciones
  Object.assign(post, { ...updateData });
  await post.save();
  return post;
};

// Eliminar publicación (solo autor)
export const deletePostRecord = async ({ id, authorId }) => {
  const post = await Post.findById(id);
  if (!post) return null;

  // Verificar que es el autor
  if (post.authorId !== authorId) {
    throw new Error('No tienes permisos para eliminar esta publicación');
  }

  await post.deleteOne();
  return post;
};

// Moderar publicación (admin/moderador)
export const moderatePostRecord = async ({ id, status, moderatorId, comments }) => {
  const post = await Post.findById(id);
  if (!post) return null;

  post.moderation = {
    status,
    moderatorId,
    comments,
    moderatedAt: new Date(),
  };

  // Si aprobada, marcar como publicada
  if (status === 'APPROVED') {
    post.isPublished = true;
  } else if (status === 'REJECTED') {
    post.isPublished = false;
  }

  await post.save();
  return post;
};

// Marcar publicación como reportada/flag
export const flagPostRecord = async ({ id }) => {
  const post = await Post.findById(id);
  if (!post) return null;

  post.flaggedCount = (post.flaggedCount || 0) + 1;
  // Opcional: si excesa umbral, despublicar
  if (post.flaggedCount >= 5) {
    post.isPublished = false;
    post.moderation.status = 'PENDING';
  }

  await post.save();
  return post;
};
