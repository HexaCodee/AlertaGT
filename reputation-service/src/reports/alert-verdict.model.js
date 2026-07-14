import { Schema, model } from 'mongoose';
import { ALERT_VERDICT } from '../../configs/reputation.rules.js';

/**
 * Estado de confianza agregado de una alerta concreta. Un documento por alerta.
 * Permite a otros servicios / al frontend preguntar rápidamente si una alerta
 * fue confirmada como falsa sin recorrer todos los reportes.
 */
const alertVerdictSchema = new Schema(
  {
    _id: {
      type: String, // usamos el postId como _id
    },
    postId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    reportsCount: { type: Number, default: 0 },
    // Conteo de reportes específicamente por "información falsa"
    falseReportsCount: { type: Number, default: 0 },
    // Desglose por motivo: { FALSE_INFO: 3, SPAM: 1, ... }
    reasonBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    verdict: {
      type: String,
      enum: Object.values(ALERT_VERDICT),
      default: ALERT_VERDICT.ACTIVE,
    },
    // Si la penalización al autor ya fue aplicada (evita doble penalización)
    penaltyApplied: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  }
);

export default model('AlertVerdict', alertVerdictSchema);
