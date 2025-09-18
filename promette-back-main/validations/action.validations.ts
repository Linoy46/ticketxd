import { body, param, ValidationChain } from "express-validator";

export const validateIdAction: ValidationChain[] = [
  body("id_accion")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id de la acción es inválido"),
];

export const validateNewAction: ValidationChain[] = [
  body("nombre_accion")
    .trim()
    .escape()
    .notEmpty()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre de la acción es inválido o excede los 50 caracteres"),

  body("descripcion")
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({ max: 255 })
    .withMessage("La descripción excede los 255 caracteres"),
];

export const validateUpdateAction: ValidationChain[] = [
  body("id_accion")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id de la acción es inválido"),

  body("nombre_accion")
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre de la acción es inválido o excede los 50 caracteres"),

  body("descripcion")
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({ max: 255 })
    .withMessage("La descripción excede los 255 caracteres"),
];