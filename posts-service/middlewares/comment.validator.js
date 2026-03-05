import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateComment = [
  body("postId")
    .notEmpty()
    .withMessage("El ID de la publicación es obligatorio"),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("El comentario no puede estar vacío")
    .isLength({ min: 1, max: 500 })
    .withMessage("El comentario debe tener entre 1 y 500 caracteres"),

  checkValidators,
];

export const validateUpdateComment = [
  param("id").notEmpty().withMessage("El ID del comentario es obligatorio"),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("El comentario no puede estar vacío")
    .isLength({ min: 1, max: 500 })
    .withMessage("El comentario debe tener entre 1 y 500 caracteres"),

  checkValidators,
];
