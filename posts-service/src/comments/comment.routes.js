import { Router } from 'express';
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from './comment.controller.js';

import {
  validateCreateComment,
  validateUpdateComment,
} from '../../middlewares/comment.validator.js';
import { asyncHandler } from '../middlewares/async-handler.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

// Listar comentarios de una publicación
router.get('/post/:postId', asyncHandler(getCommentsByPostId));

// Rutas privadas
router.post('/', validateJWT, validateCreateComment, asyncHandler(createComment));
router.put('/:id', validateJWT, validateUpdateComment, asyncHandler(updateComment));
router.delete('/:id', validateJWT, asyncHandler(deleteComment));

export default router;