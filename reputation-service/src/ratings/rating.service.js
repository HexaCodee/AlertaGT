import Rating from './rating.model.js';
import { applyRating, revertRating, recoverPenalty } from '../reputation/reputation.service.js';
import { RULES } from '../../configs/reputation.rules.js';

/**
 * Crea o actualiza la calificación de un usuario a otro. Si ya existe una
 * calificación del mismo par (rater→target) para la misma alerta, se actualiza
 * el puntaje y se ajusta la reputación de forma incremental.
 */
export const upsertRating = async ({ targetUserId, raterId, postId = null, score, comment }) => {
  const existing = await Rating.findOne({ raterId, targetUserId, postId });

  if (existing) {
    const previousScore = existing.score;
    existing.score = score;
    existing.comment = comment;
    await existing.save();

    // Ajuste incremental: quitar el voto anterior y aplicar el nuevo.
    if (previousScore !== score) {
      await revertRating({ targetUserId, score: previousScore });
      await applyRating({ targetUserId, score, refId: existing._id });
    }
    return { rating: existing, created: false };
  }

  const rating = await Rating.create({ targetUserId, raterId, postId, score, comment });
  await applyRating({ targetUserId, score, refId: rating._id });

  // La comunidad te sube: una calificación positiva ayuda a recuperar reputación.
  if (score >= RULES.RECOVERY_MIN_RATING) {
    await recoverPenalty({
      userId: targetUserId,
      points: RULES.RECOVERY_PER_POSITIVE_RATING,
      reason: `Calificación positiva de la comunidad (${score}★)`,
      refId: rating._id,
      type: 'RECOVERY',
    });
  }

  return { rating, created: true };
};

// Listar calificaciones recibidas por un usuario (paginado).
export const fetchRatingsForUser = async ({ userId, page = 1, limit = 10 }) => {
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const ratings = await Rating.find({ targetUserId: userId })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const total = await Rating.countDocuments({ targetUserId: userId });

  return {
    ratings,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Resumen (promedio + distribución de estrellas) de un usuario.
export const fetchRatingSummary = async (userId) => {
  const result = await Rating.aggregate([
    { $match: { targetUserId: userId } },
    {
      $group: {
        _id: '$score',
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;
  for (const row of result) {
    distribution[row._id] = row.count;
    sum += row._id * row.count;
    count += row.count;
  }

  return {
    average: count > 0 ? Number((sum / count).toFixed(2)) : 0,
    count,
    distribution,
  };
};
