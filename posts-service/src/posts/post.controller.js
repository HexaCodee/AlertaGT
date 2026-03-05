import axios from 'axios';
import {
  fetchPosts,
  fetchPostById,
  createPostRecord,
  updatePostRecord,
  deletePostRecord,
  moderatePostRecord,
  flagPostRecord,
  fetchPostsByProximity,
} from './post.service.js';

const GEO_SERVICE_URL = process.env.GEO_SERVICE_URL || 'http://localhost:3022/api/v1';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3021/api/v1';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

// Crear publicación
export const createPost = async (req, res) => {
  try {
    // Procesar imagen principal (si existe)
    const image = req.files?.find(f => f.fieldname === 'image') 
      ? {
          public_id: req.files.find(f => f.fieldname === 'image')?.filename || req.files.find(f => f.fieldname === 'image')?.public_id,
          url: req.files.find(f => f.fieldname === 'image')?.path || req.files.find(f => f.fieldname === 'image')?.secure_url || req.files.find(f => f.fieldname === 'image')?.url,
          mimeType: req.files.find(f => f.fieldname === 'image')?.mimetype,
          originalName: req.files.find(f => f.fieldname === 'image')?.originalname,
        }
      : null;

    // Procesar attachments adicionales
    const attachments = (req.files || [])
      .filter(f => f.fieldname === 'attachments')
      .map((f) => ({
        public_id: f.filename || f.public_id,
        url: f.path || f.secure_url || f.url,
        mimeType: f.mimetype,
        originalName: f.originalname,
      }));

    // Parsear location si viene como string JSON
    let location = req.body.location;
    if (location && typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        // Si falla el parse, dejar como está
      }
    }

    // Añadir coordinates en formato GeoJSON si existe location
    if (location && location.latitude && location.longitude) {
      location.coordinates = [location.longitude, location.latitude];
    }

    const post = await createPostRecord({
      postData: { ...req.body, location },
      authorId: req.user.id,
      image,
      attachments,
    });

    // Disparar notificaciones de forma asíncrona (no bloquear la respuesta)
    try {
      triggerNotifications(post);
    } catch (e) {
      console.error('Error triggering notifications:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      data: post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la publicación',
      error: err.message,
    });
  }
};

// Listar publicaciones
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const { posts, pagination } = await fetchPosts({ page, limit, category });

    res.status(200).json({
      success: true,
      data: posts,
      pagination,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las publicaciones',
      error: err.message,
    });
  }
};

// Obtener publicación por ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await fetchPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la publicación',
      error: err.message,
    });
  }
};

// Actualizar publicación (solo autor)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Procesar imagen principal si viene en la actualización
    const image = req.files?.find(f => f.fieldname === 'image') 
      ? {
          public_id: req.files.find(f => f.fieldname === 'image')?.filename || req.files.find(f => f.fieldname === 'image')?.public_id,
          url: req.files.find(f => f.fieldname === 'image')?.path || req.files.find(f => f.fieldname === 'image')?.secure_url || req.files.find(f => f.fieldname === 'image')?.url,
          mimeType: req.files.find(f => f.fieldname === 'image')?.mimetype,
          originalName: req.files.find(f => f.fieldname === 'image')?.originalname,
        }
      : null;

    // Procesar attachments adicionales
    const attachments = (req.files || [])
      .filter(f => f.fieldname === 'attachments')
      .map((f) => ({
        public_id: f.filename || f.public_id,
        url: f.path || f.secure_url || f.url,
        mimeType: f.mimetype,
        originalName: f.originalname,
      }));

    // Parsear location si viene como string JSON
    let updateData = { ...req.body };
    if (updateData.location && typeof updateData.location === 'string') {
      try {
        updateData.location = JSON.parse(updateData.location);
      } catch (e) {
        // Si falla el parse, dejar como está
      }
    }

    // Añadir coordinates en formato GeoJSON si existe location
    if (updateData.location && updateData.location.latitude && updateData.location.longitude) {
      updateData.location.coordinates = [updateData.location.longitude, updateData.location.latitude];
    }

    const post = await updatePostRecord({
      id,
      updateData,
      authorId: req.user.id,
      image,
      attachments,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada o no tienes permisos',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Publicación actualizada exitosamente',
      data: post,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la publicación',
      error: err.message,
    });
  }
};

// Eliminar publicación (solo autor)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await deletePostRecord({
      id,
      authorId: req.user.id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada o no tienes permisos',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Publicación eliminada exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la publicación',
      error: err.message,
    });
  }
};

// Moderar publicación (admin/moderador)
export const moderatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const moderatorId = req.user.id;
    const post = await moderatePostRecord({ id, status, moderatorId, comments });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Publicación moderada', data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error al moderar', error: err.message });
  }
};

// Reportar publicación
export const flagPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await flagPostRecord({ id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Publicación reportada', data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error al reportar', error: err.message });
  }
};

// Disparar notificaciones a usuarios cercanos (llamadas inter-servicio)
async function triggerNotifications(post) {
  try {
    if (!post.location || !post.location.latitude || !post.location.longitude) return;

    const nearbyResp = await axios.get(`${GEO_SERVICE_URL}/locations/nearby/tokens`, {
      params: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        maxDistance: 2000,
      },
      headers: { 'x-service-token': SERVICE_TOKEN },
    });

    const tokens = nearbyResp.data?.data?.tokens || [];
    if (!tokens.length) return;

    // Crear notificaciones en notifications-service (y enviar FCM)
    await Promise.all(tokens.map(t =>
      axios.post(`${NOTIFICATIONS_SERVICE_URL}/notifications`, {
        userId: t.userId,
        postId: post._id,
        type: 'NEW_ALERT',
        title: post.title,
        body: post.text?.substring(0, 120) || '',
        data: {
          postId: post._id,
          category: post.category,
        },
      }, {
        headers: { 'x-service-token': SERVICE_TOKEN }
      })
    ));
  } catch (err) {
    console.error('triggerNotifications error:', err.message);
  }
}

// Obtener posts por proximidad (2km por defecto)
export const getPostsByProximity = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 2000, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren parámetros latitude y longitude',
      });
    }

    const { posts, count } = await fetchPostsByProximity({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: parseInt(maxDistance),
      category,
      onlyPublished: true,
    });

    res.status(200).json({
      success: true,
      data: posts,
      count,
      location: { latitude, longitude },
      searchRadius: maxDistance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener publicaciones cercanas',
      error: err.message,
    });
  }
};
