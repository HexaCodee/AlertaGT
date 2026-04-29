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
import { asyncHandler } from '../middlewares/async-handler.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import upload from '../../middlewares/upload.js';
import { validateAttachmentsMiddleware } from '../../middlewares/attachment-validator.js';

const router = Router();

// Rutas públicas
router.get('/', asyncHandler(getPosts));               // Listar publicaciones
router.get('/proximity/search', asyncHandler(getPostsByProximity));  // Buscar por ubicación (2km)
router.get('/:id', asyncHandler(getPostById));        // Obtener publicación por ID

// Rutas privadas (requieren autenticación)
router.post('/', validateJWT, upload.array('attachments', 6), validateAttachmentsMiddleware, validateCreatePost, asyncHandler(createPost));
router.put('/:id', validateJWT, upload.array('attachments', 6), validateAttachmentsMiddleware, validateUpdatePost, asyncHandler(updatePost));
router.delete('/:id', validateJWT, asyncHandler(deletePost));

// Moderación y reportes
router.put('/:id/moderate', validateJWT, requireRole('ADMIN_ROLE','MODERATOR_ROLE'), asyncHandler(moderatePost));
router.post('/:id/flag', asyncHandler(flagPost));

export default router;
