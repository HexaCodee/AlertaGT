import {
  getOrCreateReputation,
  evaluateCanPublish,
  forceRecompute,
  applyPenalty,
  recoverPenalty,
  fetchLeaderboard,
} from './reputation.service.js';
import { RULES } from '../../configs/reputation.rules.js';

// GET /reputation/:userId  → reputación pública de un usuario
export const getReputation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rep = await getOrCreateReputation(userId);

    res.status(200).json({
      success: true,
      data: {
        userId: rep.userId,
        averageRating: rep.averageRating,
        ratingsCount: rep.ratingsCount,
        trustScore: rep.trustScore,
        falseAlertsCount: rep.falseAlertsCount,
        reportsReceived: rep.reportsReceived,
        status: rep.status,
        suspendedUntil: rep.suspendedUntil,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /reputation/:userId/can-publish  → lo consulta posts-service antes de publicar
export const canPublish = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await evaluateCanPublish(userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /reputation/:userId/recompute  → recomputo manual (admin/moderador)
export const recomputeReputation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rep = await forceRecompute(userId);
    res.status(200).json({ success: true, message: 'Reputación recalculada', data: rep });
  } catch (err) {
    next(err);
  }
};

// POST /reputation/:userId/penalize  → penalización manual (admin/moderador)
export const penalizeUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { points = 0, reason = 'Penalización manual' } = req.body;

    if (!Number.isFinite(Number(points)) || Number(points) <= 0) {
      return res.status(400).json({ success: false, message: 'Los puntos de penalización deben ser un número positivo' });
    }

    const rep = await applyPenalty({
      userId,
      points: Number(points),
      reason,
      refId: null,
      type: 'MANUAL',
    });

    res.status(200).json({ success: true, message: 'Penalización aplicada', data: rep });
  } catch (err) {
    next(err);
  }
};

// POST /reputation/:userId/reward  → recuperación por comunidad ayudada (servicio/admin)
export const rewardUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { milestones = 1, reason = 'Comunidad ayudada' } = req.body;

    const count = Number(milestones);
    if (!Number.isFinite(count) || count <= 0) {
      return res.status(400).json({ success: false, message: 'milestones debe ser un número positivo' });
    }

    const points = count * RULES.RECOVERY_PER_COMMUNITY_HELP;
    const rep = await recoverPenalty({
      userId,
      points,
      reason,
      refId: null,
      type: 'COMMUNITY_HELP',
    });

    res.status(200).json({ success: true, message: 'Recuperación acreditada', data: rep });
  } catch (err) {
    next(err);
  }
};

// GET /reputation/leaderboard/top  → ranking por confianza (admin/moderador)
export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const users = await fetchLeaderboard({ limit });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
