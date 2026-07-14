import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RULES } from '../../configs/reputation.rules.js';

/**
 * Calificación (estrellas) que un usuario da a otro usuario, opcionalmente en el
 * contexto de una alerta concreta. Estilo "rating de Uber".
 */
const ratingSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    // Usuario CALIFICADO
    targetUserId: {
      type: String,
      required: [true, 'El usuario calificado es obligatorio'],
      index: true,
    },
    // Usuario que EMITE la calificación
    raterId: {
      type: String,
      required: [true, 'El autor de la calificación es obligatorio'],
    },
    // Alerta/publicación que motivó la calificación (opcional)
    postId: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      required: [true, 'La calificación es obligatoria'],
      min: [RULES.MIN_RATING, `La calificación mínima es ${RULES.MIN_RATING}`],
      max: [RULES.MAX_RATING, `La calificación máxima es ${RULES.MAX_RATING}`],
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Un usuario solo puede calificar a otro una vez por alerta.
// (postId null => una calificación "general" por par de usuarios)
ratingSchema.index({ raterId: 1, targetUserId: 1, postId: 1 }, { unique: true });
ratingSchema.index({ targetUserId: 1, createdAt: -1 });

export default model('Rating', ratingSchema);
