import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const notificationSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    // ID del usuario que recibe la notificación
    userId: {
      type: String,
      required: [true, 'El ID de usuario es obligatorio'],
      index: true,
    },
    // ID de la publicación relacionada
    postId: {
      type: String,
      required: [true, 'El ID de la publicación es obligatorio'],
    },
    // Tipo de notificación (new_alert, new_comment, moderation, etc)
    type: {
      type: String,
      enum: ['NEW_ALERT', 'NEW_COMMENT', 'MODERATION', 'FLAGGED', 'SYSTEM'],
      default: 'NEW_ALERT',
    },
    // Título de la notificación
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
    },
    // Cuerpo de la notificación
    body: {
      type: String,
      required: [true, 'El cuerpo es obligatorio'],
    },
    // Datos adicionales (JSON)
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // Si se leyó
    read: {
      type: Boolean,
      default: false,
    },
    // Timestamp de lectura
    readAt: {
      type: Date,
    },
    // Si se envió via FCM
    sentViaFCM: {
      type: Boolean,
      default: false,
    },
    // Respuesta de Firebase
    fcmResponse: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para búsquedas rápidas
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1, userId: 1 });
notificationSchema.index({ postId: 1 });

export default model('Notification', notificationSchema);
