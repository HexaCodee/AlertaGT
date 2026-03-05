import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreatePost = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 2, max: 150 })
    .withMessage("El título debe tener entre 2 y 150 caracteres"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isIn(["ACCIDENTE", "TRAFICO", "PELIGRO", "OTROS"])
    .withMessage("Categoría no válida"),

  body("riskType")
    .optional()
    .isIn(["LEVE", "MODERADO", "GRAVE"])
    .withMessage("Tipo de riesgo no válido"),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("El contenido de la publicación es obligatorio")
    .isLength({ min: 5 })
    .withMessage("El texto debe tener al menos 5 caracteres"),

  
  body("location")
    .optional()
    .custom((value, { req }) => {
      if (value) {
        const hasLat = value.latitude !== undefined && value.latitude !== null;
        const hasLng = value.longitude !== undefined && value.longitude !== null;
        if (hasLat !== hasLng) {
          throw new Error('Si se provee latitud, se debe proveer longitud (y viceversa)');
        }
      }
      return true;
    }),

  checkValidators,
];

export const validateUpdatePost = [
  param("id").notEmpty().withMessage("El ID de la publicación es obligatorio"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("El título debe tener entre 2 y 150 caracteres"),

  body("category")
    .optional()
    .trim()
    .isIn(["ACCIDENTE", "TRAFICO", "PELIGRO", "OTROS"])
    .withMessage("Categoría no válida"),

  body("riskType")
    .optional()
    .isIn(["LEVE", "MODERADO", "GRAVE"])
    .withMessage("Tipo de riesgo no válido"),

  body("text")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("El texto debe tener al menos 5 caracteres"),

  body("location")
    .optional()
    .custom((value, { req }) => {
      if (value) {
        const hasLat = value.latitude !== undefined && value.latitude !== null;
        const hasLng = value.longitude !== undefined && value.longitude !== null;
        if (hasLat !== hasLng) {
          throw new Error('Si se provee latitud, se debe proveer longitud (y viceversa)');
        }
      }
      return true;
    }),

  checkValidators,
];
