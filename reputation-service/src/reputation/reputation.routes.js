import { Router } from 'express';
import {
  getReputation,
  canPublish,
  recomputeReputation,
  penalizeUser,
  rewardUser,
  getLeaderboard,
} from './reputation.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * Permite el acceso si viene con un service-token válido (llamada entre
 * microservicios) o, en su defecto, con JWT de un admin/moderador.
 */
const allowServiceOrModerator = (req, res, next) => {
  const serviceToken = req.headers['x-service-token'];
  if (serviceToken) {
    if (serviceToken === process.env.SERVICE_TOKEN) return next();
    return res.status(401).json({ success: false, message: 'Service token inválido' });
  }
  return validateJWT(req, res, () => requireRole('ADMIN_ROLE', 'MODERATOR_ROLE')(req, res, next));
};

/**
 * @swagger
 * /api/v1/reputation/leaderboard/top:
 *   get:
 *     summary: Ranking de usuarios por puntuación de confianza
 *     tags: [Reputation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Ranking de reputación }
 */
router.get('/leaderboard/top', validateJWT, requireRole('ADMIN_ROLE', 'MODERATOR_ROLE'), asyncHandler(getLeaderboard));

/**
 * @swagger
 * /api/v1/reputation/{userId}:
 *   get:
 *     summary: Reputación pública de un usuario (estrellas, confianza, estado)
 *     tags: [Reputation]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reputación del usuario }
 */
router.get('/:userId', asyncHandler(getReputation));

/**
 * @swagger
 * /api/v1/reputation/{userId}/can-publish:
 *   get:
 *     summary: Indica si el usuario puede publicar (no suspendido)
 *     description: Endpoint consultado por posts-service antes de permitir publicar una alerta.
 *     tags: [Reputation]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Resultado de la evaluación }
 */
router.get('/:userId/can-publish', asyncHandler(canPublish));

/**
 * @swagger
 * /api/v1/reputation/{userId}/recompute:
 *   post:
 *     summary: Fuerza el recálculo de la reputación de un usuario
 *     tags: [Reputation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reputación recalculada }
 */
router.post('/:userId/recompute', validateJWT, requireRole('ADMIN_ROLE', 'MODERATOR_ROLE'), asyncHandler(recomputeReputation));

/**
 * @swagger
 * /api/v1/reputation/{userId}/penalize:
 *   post:
 *     summary: Aplica una penalización manual a un usuario
 *     tags: [Reputation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points: { type: number, example: 20 }
 *               reason: { type: string, example: 'Alerta falsa reincidente' }
 *     responses:
 *       200: { description: Penalización aplicada }
 */
router.post('/:userId/penalize', validateJWT, requireRole('ADMIN_ROLE', 'MODERATOR_ROLE'), asyncHandler(penalizeUser));

/**
 * @swagger
 * /api/v1/reputation/{userId}/reward:
 *   post:
 *     summary: Acredita recuperación de reputación por comunidad ayudada
 *     description: Llamado por otros servicios (x-service-token) o por un admin/moderador. Reduce la penalización acumulada del usuario.
 *     tags: [Reputation]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               milestones: { type: number, example: 1, description: 'Nº de hitos de contribución a acreditar' }
 *               reason: { type: string, example: 'Comunidad ayudada: 10 comentarios recibidos' }
 *     responses:
 *       200: { description: Recuperación acreditada }
 */
router.post('/:userId/reward', allowServiceOrModerator, asyncHandler(rewardUser));

export default router;
