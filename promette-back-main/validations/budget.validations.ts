import { body, param, ValidationChain } from "express-validator";

// Validaciones para obtener financiamiento por ID
export const validateIdFinanciamiento: ValidationChain[] = [
  param("id_financiamiento")
    .isInt()
    .withMessage("El ID de financiamiento es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID de financiamiento es obligatorio"),
];

// Validaciones para crear un nuevo financiamiento
export const validateNewFinanciamiento: ValidationChain[] = [
  body("nombre_financiamiento")
    .isString()
    .withMessage("El nombre del financiamiento es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del financiamiento es obligatorio"),

  body("estado")
    .isInt()
    .withMessage("El estado es inválido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),
];

// Validaciones para actualizar financiamiento
export const validateUpdateFinanciamiento: ValidationChain[] = [
  body("id_financiamiento")
    .isInt()
    .withMessage("El ID de financiamiento es inválido")
    .notEmpty()
    .withMessage("El ID de financiamiento es obligatorio"),

  body("nombre_financiamiento")
    .isString()
    .withMessage("El nombre del financiamiento es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del financiamiento es obligatorio"),

  body("estado")
    .isInt()
    .withMessage("El estado es inválido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),
];

// Validaciones para eliminar financiamiento
export const validateDeleteFinanciamiento: ValidationChain[] = [
  body("id_financiamiento")
    .isInt()
    .withMessage("El ID de financiamiento es inválido")
    .notEmpty()
    .withMessage("El ID de financiamiento es obligatorio"),
];
