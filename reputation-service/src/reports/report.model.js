import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { REPORT_REASONS, REPORT_STATUS } from '../../configs/reputation.rules.js';

/**
 * Reporte individual de una alerta presuntamente falsa (o inapropiada).
 * Un usuario solo puede reportar una alerta una vez (índice único postId+reporterId).
 */
const reportSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    // Alerta reportada
    postId: {
      type: String,
      required: [true, 'El ID de la alerta es obligatorio'],
      index: true,
    },
    // Autor de la alerta (denormalizado desde posts-service para penalizar)
    authorId: {
      type: String,
      required: [true, 'El autor de la alerta es obligatorio'],
      index: true,
    },
    // Usuario que reporta
    reporterId: {
      type: String,
      required: [true, 'El autor del reporte es obligatorio'],
    },
    reason: {
      type: String,
      enum: {
        values: REPORT_REASONS,
        message: 'El motivo del reporte no es válido',
      },
      required: [true, 'El motivo del reporte es obligatorio'],
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
    },
    // Moderador que resolvió el reporte (si aplica)
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Un mismo usuario no puede reportar dos veces la misma alerta.
reportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

export default model('Report', reportSchema);
