import { body, param, ValidationChain } from "express-validator";

export const validateIdDevice: ValidationChain[] = [
  param("id_dispositivo")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid device ID"),
];

export const validateNewDevice: ValidationChain[] = [
  body("nombre_dispositivo")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage("Device name must be between 3 and 100 characters"),

  body("descripcion")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),
];

export const validateUpdateDevice: ValidationChain[] = [
  param("id_dispositivo")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid device ID"),

  body("nombre_dispositivo")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 100 })
    .withMessage("Device name must be between 3 and 100 characters"),

  body("descripcion")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),
];
