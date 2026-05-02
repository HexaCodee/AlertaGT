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

/**
 * @swagger
 * /api/v1/comments/post/{postId}:
 *   get:
 *     summary: Lista los comentarios de una publicación
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get('/post/:postId', asyncHandler(getCommentsByPostId));

/**
 * @swagger
 * /api/v1/comments:
 *   post:
 *     summary: Crea un comentario en una publicación
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado
 */
router.post('/', validateJWT, validateCreateComment, asyncHandler(createComment));
/**
 * @swagger
 * /api/v1/comments/{id}:
 *   put:
 *     summary: Actualiza un comentario existente
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado
 */
router.put('/:id', validateJWT, validateUpdateComment, asyncHandler(updateComment));
/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: Elimina un comentario
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado
 */
router.delete('/:id', validateJWT, asyncHandler(deleteComment));

export default router;