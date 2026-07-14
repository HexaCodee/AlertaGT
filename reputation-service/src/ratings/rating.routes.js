import { Router } from 'express';
import {
  createRating,
  getUserRatings,
  getUserRatingSummary,
} from './rating.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

/**
 * @swagger
 * /api/v1/ratings:
 *   post:
 *     summary: Califica a un usuario (estrellas 1-5)
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId: { type: string, example: user-123 }
 *               postId: { type: string, example: post-123 }
 *               score: { type: integer, example: 5 }
 *               comment: { type: string, example: 'Alerta muy útil y precisa' }
 *             required: [targetUserId, score]
 *     responses:
 *       201: { description: Calificación registrada }
 *       200: { description: Calificación actualizada }
 *       400: { description: Datos inválidos }
 */
router.post('/', validateJWT, asyncHandler(createRating));

/**
 * @swagger
 * /api/v1/ratings/user/{userId}:
 *   get:
 *     summary: Lista las calificaciones recibidas por un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Calificaciones del usuario }
 */
router.get('/user/:userId', asyncHandler(getUserRatings));

/**
 * @swagger
 * /api/v1/ratings/user/{userId}/summary:
 *   get:
 *     summary: Promedio y distribución de estrellas de un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Resumen de calificaciones }
 */
router.get('/user/:userId/summary', asyncHandler(getUserRatingSummary));

export default router;
