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

import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

// Listar comentarios de una publicación
router.get('/post/:postId', getCommentsByPostId);

// Rutas privadas
router.post('/', validateJWT, validateCreateComment, createComment);
router.put('/:id', validateJWT, validateUpdateComment, updateComment);
router.delete('/:id', validateJWT, deleteComment);

export default router;