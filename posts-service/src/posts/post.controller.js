import axios from 'axios';
import {
  fetchPosts,
  fetchPostById,
  countPostsByAuthor,
  countCommunityHelpedByAuthor,
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
    const attachments = attachmentFiles.map((f) => ({
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

    let moderation = undefined;
    if (req.body['moderation.status']) {
      moderation = { status: req.body['moderation.status'] };
    } else if (req.body.moderation) {
      let rawModeration = req.body.moderation;
      if (typeof rawModeration === 'string') {
        try {
          moderation = JSON.parse(rawModeration);
        } catch (e) {
          moderation = undefined;
        }
      } else {
        moderation = rawModeration;
      }
    }

    // Manejar booleanos explícitos enviados como string en FormData
    let isPublished = req.body.isPublished;
    if (isPublished === 'true') isPublished = true;
    if (isPublished === 'false') isPublished = false;
    if (isPublished === undefined) isPublished = true;

    const post = await createPostRecord({
      postData: { 
        title: sanitizeText(req.body.title),
        category: req.body.category,
        riskType: req.body.riskType,
        text: sanitizeText(req.body.text),
        location,
        isPublished,
        moderation
      },
      authorId: req.user.id,
      image,
      attachments,
    });

    // Responder de inmediato al cliente para liberar el botón del frontend
    res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      data: post,
    });

    // Ejecutar notificaciones en segundo plano sin bloquear la respuesta de Express
    void triggerNotifications(post).catch((e) => {
      console.error('Error triggering notifications:', e.message);
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
    const attachments = attachmentFiles.map((f) => ({
      public_id: f.filename || f.public_id,
      url: f.path || f.secure_url || f.url,
      mimeType: f.mimetype,
      originalName: f.originalname,
    }));

    // Parsear campos si vienen como string JSON
    let updateData = { ...req.body };
    if (updateData.location && typeof updateData.location === 'string') {
      try {
        updateData.location = JSON.parse(updateData.location);
      } catch (e) {
        // Si falla el parse, dejar como está
      }
    }

    if (updateData['moderation.status']) {
      updateData.moderation = { status: updateData['moderation.status'] };
      delete updateData['moderation.status'];
    } else if (updateData.moderation && typeof updateData.moderation === 'string') {
      try {
        updateData.moderation = JSON.parse(updateData.moderation);
      } catch (e) {
      }
    }

    if (updateData.isPublished === 'true') updateData.isPublished = true;
    if (updateData.isPublished === 'false') updateData.isPublished = false;

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

    const nearbyResp = await axios.get(`${GEO_SERVICE_URL}/locations/nearby/users`, {
      params: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        maxDistance: 2000,
      },
    });

    const users = nearbyResp.data?.data || [];
    if (!users.length) return;

    const notificationType = post.riskType === 'GRAVE' ? 'NEARBY_ALERT_CRITICAL' : 'NEW_ALERT';

    await Promise.all(users.map(async (user) => {
      const R = 6371000;
      const dLat = (user.latitude - post.location.latitude) * Math.PI / 180;
      const dLng = (user.longitude - post.location.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(post.location.latitude * Math.PI / 180) * Math.cos(user.latitude * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      await axios.post(`${NOTIFICATIONS_SERVICE_URL}/notifications`, {
        userId: user.userId,
        postId: post._id,
        type: notificationType,
        title: post.title,
        body: post.text?.substring(0, 120) || '',
        data: {
          postId: post._id,
          category: post.category,
          riskType: post.riskType,
          distance,
          latitude: post.location.latitude,
          longitude: post.location.longitude,
        },
        fcmToken: user.fcmToken || null,
      }, {
        headers: { 'x-service-token': SERVICE_TOKEN }
      });
    }));
  } catch (err) {
    console.error('triggerNotifications error:', err.message);
  }
}

// Obtener posts por proximidad
export const getPostsByProximity = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren parámetros latitude y longitude',
      });
    }

    const searchRadius = maxDistance ? parseInt(maxDistance) : 10000;

    const { posts, count } = await fetchPostsByProximity({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: searchRadius,
      category,
      onlyPublished: false,
    });

    return res.status(200).json({
      success: true,
      data: posts || [], // Asegura mapear un arreglo al frontend para evitar romper el .map() de React
      count: count || 0,
      location: { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      },
      searchRadius: searchRadius,
    });

  } catch (err) {
    next(err);
  }
};

export const getUserPostCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await countPostsByAuthor(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserCommunityHelped = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await countCommunityHelpedByAuthor(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    next(err);
  }
};