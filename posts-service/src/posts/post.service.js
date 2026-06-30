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
    moderation: postData.moderation ?? { status: 'APPROVED' },
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
export const fetchPostsByProximity = async ({ latitude, longitude, maxDistance = 20000, category, onlyPublished = false }) => { // 👈 Cambiado a false por defecto para pruebas locales
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);
  const maxDistNum = parseInt(maxDistance) || 20000;

  // 1. Condiciones básicas: solo arrastramos que esté activa
  const matchConditions = { isActive: true };
  
  if (category && category.toLowerCase() !== 'all') {
    matchConditions.category = category.trim().toUpperCase();
  }

  // 2. Pipeline de agregación geoespacial
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat]
        },
        distanceField: "distance", 
        maxDistance: maxDistNum,
        spherical: true,
        key: "location.coordinates" 
      }
    },
    {
      $match: matchConditions
    },
    {
      $sort: { distance: 1 } 
    }
  ];

  const posts = await Post.aggregate(pipeline);

  return {
    posts: posts || [],
    count: posts.length
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

//Contar publicaciones aprobadas y publicadas de un autor
export const countPostsByAuthor = async (authorId) => {
  return await Post.countDocuments({
    authorId,
    isActive: true,
    isPublished: true,
    'moderation.status': 'APPROVED',
  });
};

// Contar total de comentarios recibidos en las publicaciones del usuario
export const countCommunityHelpedByAuthor = async (authorId) => {
  const posts = await Post.find({ authorId, isActive: true }, { _id: 1 }).lean();
  const postIds = posts.map((p) => p._id);
  if (postIds.length === 0) return 0;

  const Comment = (await import('../comments/comment.model.js')).default;
  return await Comment.countDocuments({ postId: { $in: postIds }, isActive: true });
};
