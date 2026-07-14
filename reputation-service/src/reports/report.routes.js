import { Router } from 'express';
import {
  createReport,
  getAlertVerdict,
  getMyReports,
  listReports,
  resolveReport,
} from './report.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     summary: Reporta una alerta (p. ej. como falsa)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId: { type: string, example: post-123 }
 *               reason:
 *                 type: string
 *                 enum: [FALSE_INFO, DUPLICATE, RESOLVED, SPAM, OFFENSIVE, OTHER]
 *               comment: { type: string, example: 'No hay ningún accidente en esa zona' }
 *             required: [postId, reason]
 *     responses:
 *       201: { description: Reporte registrado }
 *       404: { description: Alerta no encontrada }
 *       409: { description: Ya habías reportado esta alerta }
 */
router.post('/', validateJWT, asyncHandler(createReport));

/**
 * @swagger
 * /api/v1/reports/mine:
 *   get:
 *     summary: Reportes emitidos por el usuario autenticado
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de reportes del usuario }
 */
router.get('/mine', validateJWT, asyncHandler(getMyReports));

/**
 * @swagger
 * /api/v1/reports/alert/{postId}:
 *   get:
 *     summary: Veredicto agregado de una alerta (conteo de reportes y estado)
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Veredicto de la alerta }
 */
router.get('/alert/:postId', asyncHandler(getAlertVerdict));

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: Lista de reportes para moderación
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, UPHELD, DISMISSED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Lista de reportes }
 */
router.get('/', validateJWT, requireRole('ADMIN_ROLE', 'MODERATOR_ROLE'), asyncHandler(listReports));

/**
 * @swagger
 * /api/v1/reports/{id}/resolve:
 *   patch:
 *     summary: Resuelve un reporte (confirmar o desestimar)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision: { type: string, enum: [UPHELD, DISMISSED] }
 *             required: [decision]
 *     responses:
 *       200: { description: Reporte resuelto }
 *       404: { description: Reporte no encontrado }
 */
router.patch('/:id/resolve', validateJWT, requireRole('ADMIN_ROLE', 'MODERATOR_ROLE'), asyncHandler(resolveReport));

export default router;
