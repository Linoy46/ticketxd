import { body, param, ValidationChain } from "express-validator";

export const validateIdDirection: ValidationChain[] = [
  param("id_direccion")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid direction ID"),
];

export const validateNewDirection: ValidationChain[] = [
  body("nombre_direccion")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 250 })
    .withMessage("Direction name must be between 3 and 250 characters"),

  body("ct_dependencia_id")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Invalid dependency ID"),

  body("ct_usuario_in")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),

  body("ct_usuario_at")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
];

export const validateUpdateDirection: ValidationChain[] = [
  body("id_direccion")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid direction ID"),

  body("nombre_direccion")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 250 })
    .withMessage("Direction name must be between 3 and 250 characters"),

  body("estado")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 0, max: 1 })
    .withMessage("Invalid state, must be 0 or 1"),

  body("ct_dependencia_id")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Invalid dependency ID"),

  body("ct_usuario_at")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
];
