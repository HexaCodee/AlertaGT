/**
 * Reglas centrales del sistema de reputación de AlertaGT.
 *
 * Toda la lógica de umbrales, penalizaciones y cálculo de confianza vive aquí
 * para poder ajustarla sin tocar los controladores/servicios.
 *
 * Los valores pueden sobreescribirse por variables de entorno para afinar el
 * comportamiento en cada ambiente sin recompilar.
 */

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const RULES = {
  // Cuántos reportes de "información falsa" distintos necesita una alerta para
  // considerarse CONFIRMED_FALSE de forma automática.
  FALSE_REPORT_THRESHOLD: num(process.env.FALSE_REPORT_THRESHOLD, 5),

  // Puntos de penalización que recibe el AUTOR cada vez que una de sus alertas
  // se confirma como falsa (automática o por moderador).
  PENALTY_PER_FALSE_ALERT: num(process.env.PENALTY_PER_FALSE_ALERT, 20),

  // A partir de estos puntos acumulados el usuario queda en estado de aviso.
  WARN_THRESHOLD: num(process.env.WARN_THRESHOLD, 40),

  // A partir de estos puntos el usuario queda suspendido temporalmente.
  SUSPEND_THRESHOLD: num(process.env.SUSPEND_THRESHOLD, 100),

  // Días que dura una suspensión temporal.
  SUSPENSION_DAYS: num(process.env.SUSPENSION_DAYS, 15),

  // Puntuación de confianza por defecto para un usuario sin historial.
  DEFAULT_TRUST_SCORE: num(process.env.DEFAULT_TRUST_SCORE, 70),

  // ── Recuperación de reputación (la penalización NO es permanente) ──

  // Buena conducta en el tiempo: cada PENALTY_DECAY_DAYS sin nuevas
  // penalizaciones se descuentan PENALTY_DECAY_POINTS de la penalización.
  PENALTY_DECAY_DAYS: num(process.env.PENALTY_DECAY_DAYS, 30),
  PENALTY_DECAY_POINTS: num(process.env.PENALTY_DECAY_POINTS, 5),

  // La comunidad te sube: cada calificación positiva (>= RECOVERY_MIN_RATING
  // estrellas) reduce la penalización en RECOVERY_PER_POSITIVE_RATING puntos.
  RECOVERY_MIN_RATING: num(process.env.RECOVERY_MIN_RATING, 4),
  RECOVERY_PER_POSITIVE_RATING: num(process.env.RECOVERY_PER_POSITIVE_RATING, 2),

  // Comunidad ayudada: puntos de penalización que se recuperan por cada hito de
  // contribución útil acreditado vía el endpoint /reward.
  RECOVERY_PER_COMMUNITY_HELP: num(process.env.RECOVERY_PER_COMMUNITY_HELP, 3),

  // Rango válido de estrellas para una calificación de usuario.
  MIN_RATING: 1,
  MAX_RATING: 5,
};

export const REPUTATION_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  WARNED: 'WARNED',
  SUSPENDED: 'SUSPENDED',
});

export const ALERT_VERDICT = Object.freeze({
  ACTIVE: 'ACTIVE',       // Sin reportes relevantes
  FLAGGED: 'FLAGGED',     // Con reportes pero sin alcanzar el umbral
  CONFIRMED_FALSE: 'CONFIRMED_FALSE', // Confirmada como falsa
});

export const REPORT_REASONS = Object.freeze([
  'FALSE_INFO',   // Información falsa / alerta inventada
  'DUPLICATE',    // Alerta duplicada
  'RESOLVED',     // El incidente ya no existe / fue resuelto
  'SPAM',         // Spam o publicidad
  'OFFENSIVE',    // Contenido ofensivo o inapropiado
  'OTHER',        // Otro motivo
]);

export const REPORT_STATUS = Object.freeze({
  PENDING: 'PENDING',     // A la espera de umbral o revisión de moderador
  UPHELD: 'UPHELD',       // Moderador confirmó que la alerta es falsa
  DISMISSED: 'DISMISSED', // Moderador desestimó el reporte
});

/**
 * Calcula la puntuación de confianza (0-100) de un usuario a partir de su
 * promedio de estrellas y sus puntos de penalización.
 *
 * - Sin calificaciones: parte del valor neutral DEFAULT_TRUST_SCORE.
 * - Cada estrella por encima/por debajo de 3 desplaza la confianza ±10.
 * - Los puntos de penalización se restan directamente.
 */
export const computeTrustScore = ({ averageRating = 0, ratingsCount = 0, penaltyPoints = 0 }) => {
  const ratingInfluence = ratingsCount > 0 ? (averageRating - 3) * 10 : 0; // -20..+20
  const raw = RULES.DEFAULT_TRUST_SCORE + ratingInfluence - penaltyPoints;
  return Math.max(0, Math.min(100, Math.round(raw)));
};

/**
 * Determina el estado (ACTIVE/WARNED/SUSPENDED) y la fecha de fin de suspensión
 * a partir de los puntos de penalización acumulados.
 */
export const resolveStatus = (penaltyPoints, currentSuspendedUntil = null) => {
  if (penaltyPoints >= RULES.SUSPEND_THRESHOLD) {
    // Si ya estaba suspendido y la fecha sigue vigente, se conserva.
    const stillSuspended = currentSuspendedUntil && new Date(currentSuspendedUntil) > new Date();
    const suspendedUntil = stillSuspended
      ? currentSuspendedUntil
      : new Date(Date.now() + RULES.SUSPENSION_DAYS * 24 * 60 * 60 * 1000);
    return { status: REPUTATION_STATUS.SUSPENDED, suspendedUntil };
  }
  if (penaltyPoints >= RULES.WARN_THRESHOLD) {
    return { status: REPUTATION_STATUS.WARNED, suspendedUntil: null };
  }
  return { status: REPUTATION_STATUS.ACTIVE, suspendedUntil: null };
};

/**
 * Calcula cuántos puntos de penalización debe recuperar un usuario por buena
 * conducta en el tiempo (sin nuevas penalizaciones), a partir de la fecha de la
 * última recuperación/penalización.
 *
 * Devuelve { points, newAnchor } donde:
 *  - points: puntos a descontar de la penalización (>= 0).
 *  - newAnchor: nueva marca de tiempo desde la que seguir midiendo el decaimiento
 *    (o el ancla original si aún no se cumple un ciclo completo).
 */
export const computeDecay = (anchorDate, now = new Date()) => {
  if (!anchorDate) return { points: 0, newAnchor: anchorDate };

  const periodMs = RULES.PENALTY_DECAY_DAYS * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - new Date(anchorDate).getTime();
  if (elapsed < periodMs || periodMs <= 0) return { points: 0, newAnchor: anchorDate };

  const periods = Math.floor(elapsed / periodMs);
  const points = periods * RULES.PENALTY_DECAY_POINTS;
  // Avanzamos el ancla solo por los ciclos completos consumidos.
  const newAnchor = new Date(new Date(anchorDate).getTime() + periods * periodMs);
  return { points, newAnchor };
};
