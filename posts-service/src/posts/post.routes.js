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

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Lista todas las publicaciones
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 */
router.get('/', asyncHandler(getPosts));               // Listar publicaciones

/**
 * @swagger
 * /api/v1/posts/proximity/search:
 *   get:
 *     summary: Busca publicaciones por proximidad
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Resultados de búsqueda por proximidad
 */
router.get('/proximity/search', asyncHandler(getPostsByProximity));  // Buscar por ubicación (2km)

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Obtiene una publicación por ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publicación encontrada
 */
router.get('/:id', asyncHandler(getPostById));        // Obtener publicación por ID

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Crea una nueva publicación
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Publicación creada
 */
router.post('/', validateJWT, upload.array('attachments', 6), validateAttachmentsMiddleware, validateCreatePost, asyncHandler(createPost));

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   put:
 *     summary: Actualiza una publicación existente
 *     tags:
 *       - Posts
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Publicación actualizada
 */
router.put('/:id', validateJWT, upload.array('attachments', 6), validateAttachmentsMiddleware, validateUpdatePost, asyncHandler(updatePost));

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Elimina una publicación
 *     tags:
 *       - Posts
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
 *         description: Publicación eliminada
 */
router.delete('/:id', validateJWT, asyncHandler(deletePost));

/**
 * @swagger
 * /api/v1/posts/{id}/moderate:
 *   put:
 *     summary: Modera una publicación
 *     tags:
 *       - Posts
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
 *         description: Publicación moderada
 */
router.put('/:id/moderate', validateJWT, requireRole('ADMIN_ROLE','MODERATOR_ROLE'), asyncHandler(moderatePost));

/**
 * @swagger
 * /api/v1/posts/{id}/flag:
 *   post:
 *     summary: Marca una publicación como reportada
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publicación marcada como reportada
 */
router.post('/:id/flag', asyncHandler(flagPost));

export default router;
