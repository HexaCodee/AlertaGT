import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const commentSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    postId: {
      type: String,
      required: [true, "La publicación es obligatoria"],
    },
    authorId: {
      type: String,
      required: [true, "El autor es obligatorio"],
    },
    text: {
      type: String,
      required: [true, "El comentario no puede estar vacío"],
      trim: true,
      minLength: [1, "El comentario debe tener al menos 1 carácter"],
      maxLength: [500, "El comentario no puede exceder 500 caracteres"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para optimizar consultas
commentSchema.index({ postId: 1, isActive: 1 });
commentSchema.index({ authorId: 1, isActive: 1 });

export default model("Comment", commentSchema);