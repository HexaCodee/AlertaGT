import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userLocationSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    // ID del usuario
    userId: {
      type: String,
      required: [true, 'El ID de usuario es obligatorio'],
      unique: true,
      index: true,
    },
    // Ubicación actual en formato GeoJSON
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    // Latitude para referencia rápida
    latitude: {
      type: Number,
      required: true,
    },
    // Longitude para referencia rápida
    longitude: {
      type: Number,
      required: true,
    },
    // Dirección / nombre del lugar (opcional)
    address: {
      type: String,
    },
    // Si el usuario está activo en la app
    isActive: {
      type: Boolean,
      default: true,
    },
    // Última vez que actualizó su ubicación
    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },
    // FCM token para notificaciones push
    fcmToken: {
      type: String,
    },
    // Radio de búsqueda en metros (preferencia del usuario)
    searchRadius: {
      type: Number,
      default: 2000, // 2km por defecto
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice geoespacial para búsquedas por proximidad
userLocationSchema.index({ 'location.2dsphere': '2dsphere' });
userLocationSchema.index({ userId: 1 });
userLocationSchema.index({ isActive: 1 });

export default model('UserLocation', userLocationSchema);
