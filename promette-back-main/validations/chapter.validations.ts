import { body, param, ValidationChain } from "express-validator";

// Validación para el parámetro id_capitulo
export const validateIdCapitulo: ValidationChain[] = [
  param("id_capitulo")
    .isInt()
    .withMessage("El id del capítulo debe ser un número entero")
    .toInt(),
];

// Validaciones para crear un nuevo capítulo
export const validateNewChapter: ValidationChain[] = [
  body("clave_capitulo")
    .isInt()
    .withMessage("La clave del capítulo debe ser un número entero")
    .toInt(),

  body("nombre_capitulo")
    .isString()
    .withMessage("El nombre del capítulo debe ser texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del capítulo debe tener entre 1 y 100 caracteres"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser un valor booleano (0 o 1)")
    .toInt(),
];

// Validaciones para actualizar un capítulo
export const validateUpdateChapter: ValidationChain[] = [
  ...validateIdCapitulo,
    
  body("clave_capitulo")
    .optional()
    .isInt()
    .withMessage("La clave del capítulo debe ser un número entero")
    .toInt(),

  body("nombre_capitulo")
    .optional()
    .isString()
    .withMessage("El nombre del capítulo debe ser texto")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del capítulo debe tener entre 1 y 100 caracteres"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser un valor booleano (0 o 1)")
    .toInt(),
];