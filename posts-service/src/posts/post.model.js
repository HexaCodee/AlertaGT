import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ImageSchema = new Schema({
  public_id: { type: String },
  url: { type: String },
  mimeType: { type: String },
  originalName: { type: String },
});

const AttachmentSchema = new Schema({
  public_id: { type: String },
  url: { type: String },
  mimeType: { type: String },
  originalName: { type: String },
});

const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude] para GeoJSON
    required: false,
  },
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  manual: { type: Boolean, default: true },
});

const ModerationSchema = new Schema({
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  moderatorId: { type: String },
  comments: { type: String },
  moderatedAt: { type: Date },
});

const postSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: [true, "El título de la publicación es obligatorio"],
      trim: true,
      maxLength: [150, "El título no puede exceder 150 caracteres"],
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: ["ACCIDENTE", "TRAFICO", "PELIGRO", "OTROS"],
        message: "La categoría no es válida",
      },
    },
    riskType: {
      type: String,
      enum: ["LEVE", "MODERADO", "GRAVE"],
      default: "MODERADO",
    },
    text: {
      type: String,
      required: [true, "El contenido de la publicación es obligatorio"],
      trim: true,
      minLength: [5, "El contenido debe tener al menos 5 caracteres"],
    },
    image: {
      type: ImageSchema,
      required: false,
    },
    authorId: {
      type: String,
      required: [true, "El autor es obligatorio"],
    },
    location: {
      type: LocationSchema,
      required: false,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    moderation: {
      type: ModerationSchema,
      default: () => ({}),
    },
    flaggedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para búsquedas rápidas
postSchema.index({ isActive: 1 });
postSchema.index({ category: 1 });
postSchema.index({ authorId: 1, isActive: 1 });
postSchema.index({ 'moderation.status': 1, isPublished: 1 });
// Índice geoespacial para búsquedas por proximidad
postSchema.index({ 'location.coordinates': '2dsphere' });

export default model("Post", postSchema);
