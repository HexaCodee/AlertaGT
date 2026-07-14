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
  getUserPostCount,
  getUserCommunityHelped,
} from './post.controller.js';

import {
  validateCreatePost,
  validateUpdatePost,
} from '../../middlewares/post.validator.js';
import { asyncHandler } from '../middlewares/async-handler.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import { validateCanPublish } from '../../middlewares/validate-can-publish.js';
import upload from '../../middlewares/upload.js';
import { validateAttachmentsMiddleware } from '../../middlewares/attachment-validator.js';
console.log("Cargando rutas de posts...");
const router = Router();

const parseLocationMiddleware = (req, res, next) => {
  if (req.body.location && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location)
    } catch (e) {
    }
  }
  next()
}

/**
 * @swagger
 * /api/v1/posts/user/{userId}/count:
 * get:
 * summary: Cuenta las publicaciones de un usuario
 * tags:
 * - Posts
 * parameters:
 * - in: path
 * name: userId
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Cantidad de publicaciones
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean }
 * count: { type: number }
 */
router.get('/user/:userId/count', asyncHandler(getUserPostCount));
router.get('/user/:userId/views', asyncHandler(getUserCommunityHelped));

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Lista todas las publicaciones
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 */
router.get('/', asyncHandler(getPosts));               // Listar publicaciones

/**
 * @swagger
 * /api/v1/posts/proximity/search:
 *   get:
 *     summary: Busca publicaciones por proximidad
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 2000
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Resultados de búsqueda por proximidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *               category:
 *                 type: string
 *               riskType:
 *                 type: string
 *               text:
 *                 type: string
 *               location:
 *                 type: string
 *                 description: JSON string con latitude, longitude y address
 *               isPublished:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Publicación creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Datos de publicación inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  '/',
  validateJWT,
  validateCanPublish,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 6 },
  ]),
  validateAttachmentsMiddleware,
  parseLocationMiddleware,
  validateCreatePost,
  asyncHandler(createPost)
);

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
 *               category:
 *                 type: string
 *               riskType:
 *                 type: string
 *               text:
 *                 type: string
 *               location:
 *                 type: string
 *                 description: JSON string con latitude, longitude y address
 *               isPublished:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Publicación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Datos de publicación inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  '/:id',
  validateJWT,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 6 },
  ]),
  validateAttachmentsMiddleware,
  parseLocationMiddleware,
  validateUpdatePost,
  asyncHandler(updatePost)
);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       404:
 *         description: Publicación no encontrada o no tienes permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: APPROVED
 *               comments:
 *                 type: string
 *                 example: 'Revisión completada'
 *     responses:
 *       200:
 *         description: Publicación moderada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Publicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/:id/flag', asyncHandler(flagPost));

export default router;