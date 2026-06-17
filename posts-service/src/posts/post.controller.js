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
import { sanitizeText } from '../../middlewares/attachment-validator.js';

const GEO_SERVICE_URL = process.env.GEO_SERVICE_URL || 'http://localhost:3022/api/v1';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3021/api/v1';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

const normalizeUploadedFiles = (files) => {
  if (Array.isArray(files)) {
    return {
      imageFile: files.find((file) => file.fieldname === 'image') || null,
      attachmentFiles: files.filter((file) => file.fieldname === 'attachments'),
    };
  }

  return {
    imageFile: files?.image?.[0] ?? null,
    attachmentFiles: files?.attachments ?? [],
  };
};

// Crear publicación
export const createPost = async (req, res, next) => {
  try {
    const { imageFile, attachmentFiles } = normalizeUploadedFiles(req.files);

    // Procesar imagen principal (si existe)
    const image = imageFile
      ? {
          public_id: imageFile.filename || imageFile.public_id,
          url: imageFile.path || imageFile.secure_url || imageFile.url,
          mimeType: imageFile.mimetype,
          originalName: imageFile.originalname,
        }
      : null;

    // Procesar attachments adicionales
    const attachments = attachmentFiles
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
      postData: { 
        title: sanitizeText(req.body.title),
        category: req.body.category,
        riskType: req.body.riskType,
        text: sanitizeText(req.body.text),
        location,
        isPublished: req.body.isPublished ?? false,
        moderation: req.body.moderation ?? undefined
      },
      authorId: req.user.id,
      image,
      attachments,
    });

    // Disparar notificaciones de forma asíncrona (no bloquear la respuesta)
    void triggerNotifications(post).catch((e) => {
      console.error('Error triggering notifications:', e.message);
    });

    res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// Listar publicaciones
export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const { posts, pagination } = await fetchPosts({ page, limit, category });

    res.status(200).json({
      success: true,
      data: posts,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

// Obtener publicación por ID
export const getPostById = async (req, res, next) => {
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
    next(err);
  }
};

// Actualizar publicación (solo autor)
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageFile, attachmentFiles } = normalizeUploadedFiles(req.files);

    // Procesar imagen principal si viene en la actualización
    const image = imageFile
      ? {
          public_id: imageFile.filename || imageFile.public_id,
          url: imageFile.path || imageFile.secure_url || imageFile.url,
          mimeType: imageFile.mimetype,
          originalName: imageFile.originalname,
        }
      : null;

    // Procesar attachments adicionales
    const attachments = attachmentFiles
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
    next(err);
  }
};

// Eliminar publicación (solo autor)
export const deletePost = async (req, res, next) => {
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
    next(err);
  }
};

// Moderar publicación (admin/moderador)
export const moderatePost = async (req, res, next) => {
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
    next(err);
  }
};

// Reportar publicación
export const flagPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await flagPostRecord({ id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Publicación reportada', data: post });
  } catch (err) {
    next(err);
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

    // Determinar tipo de notificación basado en el riesgo
    const notificationType = post.riskType === 'GRAVE' ? 'NEARBY_ALERT_CRITICAL' : 'NEW_ALERT';

    // Crear notificaciones en notifications-service (y enviar FCM)
    await Promise.all(tokens.map(async (t) => {
      // Calcular distancia aproximada para este usuario
      const userLocation = nearbyResp.data?.data?.users?.find(u => u.userId === t.userId);
      let distance = null;

      if (userLocation) {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (userLocation.latitude - post.location.latitude) * Math.PI / 180;
        const dLng = (userLocation.longitude - post.location.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(post.location.latitude * Math.PI / 180) * Math.cos(userLocation.latitude * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = Math.round(R * c);
      }

      await axios.post(`${NOTIFICATIONS_SERVICE_URL}/notifications`, {
        userId: t.userId,
        postId: post._id,
        type: notificationType,
        title: post.title,
        body: post.text?.substring(0, 120) || '',
        data: {
          postId: post._id,
          category: post.category,
          riskType: post.riskType,
          distance: distance,
        },
      }, {
        headers: { 'x-service-token': SERVICE_TOKEN }
      });
    }));
  } catch (err) {
    console.error('triggerNotifications error:', err.message);
  }
}

// Obtener posts por proximidad (2km por defecto)
export const getPostsByProximity = async (req, res, next) => {
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
    next(err);
  }
};
