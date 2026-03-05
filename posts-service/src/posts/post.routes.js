import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  moderatePost,
  flagPost,
  getPostsByProximity,
} from './post.controller.js';

import {
  validateCreatePost,
  validateUpdatePost,
} from '../../middlewares/post.validator.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import upload from '../../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', getPosts);               // Listar publicaciones
router.get('/proximity/search', getPostsByProximity);  // Buscar por ubicación (2km)
router.get('/:id', getPostById);        // Obtener publicación por ID

// Rutas privadas (requieren autenticación)
router.post('/', validateJWT, upload.array('attachments', 6), validateCreatePost, createPost);
router.put('/:id', validateJWT, upload.array('attachments', 6), validateUpdatePost, updatePost);
router.delete('/:id', validateJWT, deletePost);

// Moderación y reportes
router.put('/:id/moderate', validateJWT, requireRole('ADMIN_ROLE','MODERATOR_ROLE'), moderatePost);
router.post('/:id/flag', flagPost);

export default router;
