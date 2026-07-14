import { Schema, model } from 'mongoose';
import { REPUTATION_STATUS } from '../../configs/reputation.rules.js';

/**
 * Entrada de auditoría del historial de reputación (penalizaciones, avisos, etc).
 */
const HistorySchema = new Schema(
  {
    type: {
      type: String,
      enum: ['PENALTY', 'FALSE_ALERT', 'WARN', 'SUSPENSION', 'RATING', 'MANUAL', 'RESET', 'RECOVERY', 'DECAY', 'COMMUNITY_HELP'],
      required: true,
    },
    points: { type: Number, default: 0 },
    reason: { type: String },
    refId: { type: String }, // postId, reportId o ratingId relacionado
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Reputación agregada de un usuario. Un documento por usuario.
 * Se recalcula cada vez que llega una calificación o una penalización.
 */
const reputationSchema = new Schema(
  {
    _id: {
      type: String, // usamos el userId como _id para lecturas O(1)
    },
    userId: {
      type: String,
      required: [true, 'El ID de usuario es obligatorio'],
      unique: true,
      index: true,
    },

    // ── Calificaciones (estrellas tipo Uber) ──
    ratingsCount: { type: Number, default: 0 },
    ratingsSum: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }, // 0-5

    // ── Reportes / alertas falsas ──
    falseAlertsCount: { type: Number, default: 0 }, // alertas suyas confirmadas como falsas
    reportsReceived: { type: Number, default: 0 },  // reportes totales sobre sus alertas

    // ── Penalización ──
    penaltyPoints: { type: Number, default: 0 },
    trustScore: { type: Number, default: 70 }, // 0-100
    status: {
      type: String,
      enum: Object.values(REPUTATION_STATUS),
      default: REPUTATION_STATUS.ACTIVE,
    },
    suspendedUntil: { type: Date, default: null },
    lastPenaltyAt: { type: Date, default: null },
    // Ancla para el decaimiento de penalización por buena conducta en el tiempo.
    lastDecayAt: { type: Date, default: null },

    history: { type: [HistorySchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false, // el _id lo asignamos manualmente = userId
  }
);

reputationSchema.index({ trustScore: -1 });
reputationSchema.index({ status: 1 });

export default model('Reputation', reputationSchema);
