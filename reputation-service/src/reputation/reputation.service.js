import Reputation from './reputation.model.js';
import {
  RULES,
  REPUTATION_STATUS,
  computeTrustScore,
  resolveStatus,
  computeDecay,
} from '../../configs/reputation.rules.js';

/**
 * Devuelve el documento de reputación de un usuario, creándolo con valores por
 * defecto si aún no existe.
 */
export const getOrCreateReputation = async (userId) => {
  let rep = await Reputation.findById(userId);
  if (!rep) {
    rep = await Reputation.create({
      _id: userId,
      userId,
      trustScore: RULES.DEFAULT_TRUST_SCORE,
      status: REPUTATION_STATUS.ACTIVE,
    });
  }
  return rep;
};

/**
 * Aplica el decaimiento de penalización por buena conducta en el tiempo.
 * Solo actúa si el usuario tiene penalización pendiente y ha pasado al menos un
 * ciclo completo desde la última recuperación/penalización. Muta rep en memoria
 * (no guarda); el guardado lo hace recomputeAndSave.
 */
const applyTimeDecay = (rep) => {
  if (rep.penaltyPoints <= 0) return;

  const anchor = rep.lastDecayAt || rep.lastPenaltyAt;
  const { points, newAnchor } = computeDecay(anchor);
  if (points <= 0) return;

  const applied = Math.min(points, rep.penaltyPoints);
  rep.penaltyPoints = Math.max(0, rep.penaltyPoints - applied);
  rep.lastDecayAt = newAnchor;
  rep.history.push({
    type: 'DECAY',
    points: -applied,
    reason: 'Recuperación por buena conducta',
    createdAt: new Date(),
  });
};

/**
 * Recalcula trustScore y estado a partir de los contadores actuales del
 * documento y persiste el resultado. Aplica primero el decaimiento por tiempo y
 * reactiva automáticamente al usuario si su suspensión ya venció.
 */
const recomputeAndSave = async (rep) => {
  applyTimeDecay(rep);

  rep.averageRating = rep.ratingsCount > 0
    ? Number((rep.ratingsSum / rep.ratingsCount).toFixed(2))
    : 0;

  rep.trustScore = computeTrustScore({
    averageRating: rep.averageRating,
    ratingsCount: rep.ratingsCount,
    penaltyPoints: rep.penaltyPoints,
  });

  // Si estaba suspendido pero ya venció, y los puntos bajaron del umbral,
  // resolveStatus lo devolverá a ACTIVE/WARNED automáticamente.
  const { status, suspendedUntil } = resolveStatus(rep.penaltyPoints, rep.suspendedUntil);
  rep.status = status;
  rep.suspendedUntil = suspendedUntil;

  await rep.save();
  return rep;
};

/**
 * Aplica una penalización a un usuario (por ejemplo, por una alerta confirmada
 * como falsa) y recalcula su estado.
 */
export const applyPenalty = async ({ userId, points, reason, refId, type = 'PENALTY', markFalseAlert = false }) => {
  const rep = await getOrCreateReputation(userId);

  rep.penaltyPoints += points;
  rep.lastPenaltyAt = new Date();
  // Reiniciamos el ancla de decaimiento: la buena conducta se mide desde la
  // última penalización.
  rep.lastDecayAt = new Date();
  if (markFalseAlert) rep.falseAlertsCount += 1;

  rep.history.push({ type, points, reason, refId, createdAt: new Date() });

  return recomputeAndSave(rep);
};

/**
 * Reduce la penalización de un usuario (recuperación de reputación). No baja de
 * cero. Se usa para la recuperación por calificaciones positivas y por hitos de
 * comunidad ayudada.
 */
export const recoverPenalty = async ({ userId, points, reason, refId, type = 'RECOVERY' }) => {
  const rep = await getOrCreateReputation(userId);

  if (rep.penaltyPoints <= 0 || points <= 0) {
    // Nada que recuperar: solo recalculamos por si acaso.
    return recomputeAndSave(rep);
  }

  const applied = Math.min(points, rep.penaltyPoints);
  rep.penaltyPoints = Math.max(0, rep.penaltyPoints - applied);
  rep.history.push({ type, points: -applied, reason, refId, createdAt: new Date() });

  return recomputeAndSave(rep);
};

/**
 * Registra que una alerta del usuario recibió un reporte (contador informativo).
 */
export const incrementReportsReceived = async (userId) => {
  const rep = await getOrCreateReputation(userId);
  rep.reportsReceived += 1;
  await rep.save();
  return rep;
};

/**
 * Aplica el efecto de una nueva calificación (estrellas) sobre la reputación del
 * usuario calificado.
 */
export const applyRating = async ({ targetUserId, score, refId }) => {
  const rep = await getOrCreateReputation(targetUserId);
  rep.ratingsCount += 1;
  rep.ratingsSum += score;
  rep.history.push({ type: 'RATING', points: 0, reason: `Calificación: ${score}★`, refId, createdAt: new Date() });
  return recomputeAndSave(rep);
};

/**
 * Revierte una calificación previa (cuando el usuario actualiza su voto).
 */
export const revertRating = async ({ targetUserId, score }) => {
  const rep = await getOrCreateReputation(targetUserId);
  rep.ratingsCount = Math.max(0, rep.ratingsCount - 1);
  rep.ratingsSum = Math.max(0, rep.ratingsSum - score);
  return recomputeAndSave(rep);
};

/**
 * Indica si un usuario puede publicar (no está suspendido vigente).
 * Reactiva automáticamente si la suspensión ya venció.
 */
export const evaluateCanPublish = async (userId) => {
  const rep = await getOrCreateReputation(userId);

  // Reactivación automática si la suspensión venció.
  if (rep.status === REPUTATION_STATUS.SUSPENDED && rep.suspendedUntil && new Date(rep.suspendedUntil) <= new Date()) {
    await recomputeAndSave(rep);
  }

  const suspended = rep.status === REPUTATION_STATUS.SUSPENDED
    && rep.suspendedUntil && new Date(rep.suspendedUntil) > new Date();

  return {
    allowed: !suspended,
    status: rep.status,
    trustScore: rep.trustScore,
    suspendedUntil: rep.suspendedUntil,
    reason: suspended
      ? `Cuenta suspendida por publicar alertas falsas hasta ${new Date(rep.suspendedUntil).toISOString()}`
      : null,
  };
};

/**
 * Recalcula la reputación desde cero (fuerza recomputo del estado).
 */
export const forceRecompute = async (userId) => {
  const rep = await getOrCreateReputation(userId);
  return recomputeAndSave(rep);
};

/**
 * Ranking de usuarios por trustScore (para paneles de moderación).
 */
export const fetchLeaderboard = async ({ limit = 20 } = {}) => {
  return Reputation.find().sort({ trustScore: -1 }).limit(parseInt(limit));
};
