import {
  upsertRating,
  fetchRatingsForUser,
  fetchRatingSummary,
} from './rating.service.js';
import { RULES } from '../../configs/reputation.rules.js';

// POST /ratings  → calificar a un usuario (requiere sesión)
export const createRating = async (req, res, next) => {
  try {
    const raterId = req.user.id;
    const { targetUserId, postId = null, score, comment } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId es obligatorio' });
    }

    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < RULES.MIN_RATING || numericScore > RULES.MAX_RATING) {
      return res.status(400).json({
        success: false,
        message: `La calificación debe ser un entero entre ${RULES.MIN_RATING} y ${RULES.MAX_RATING}`,
      });
    }

    if (targetUserId === raterId) {
      return res.status(400).json({ success: false, message: 'No puedes calificarte a ti mismo' });
    }

    const { rating, created } = await upsertRating({
      targetUserId,
      raterId,
      postId,
      score: numericScore,
      comment,
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Calificación registrada' : 'Calificación actualizada',
      data: rating,
    });
  } catch (err) {
    // Violación de índice único (por carrera de peticiones)
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ya has calificado a este usuario para esta alerta' });
    }
    next(err);
  }
};

// GET /ratings/user/:userId  → calificaciones recibidas
export const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { ratings, pagination } = await fetchRatingsForUser({ userId, page, limit });
    res.status(200).json({ success: true, data: ratings, pagination });
  } catch (err) {
    next(err);
  }
};

// GET /ratings/user/:userId/summary  → promedio + distribución
export const getUserRatingSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const summary = await fetchRatingSummary(userId);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};
