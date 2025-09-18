import { body, param, ValidationChain } from "express-validator";

export const validateIdAnalist: ValidationChain[] = [
  param("id_puesto_unidad")
    .isInt()
    .withMessage("El id es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El id del analista es obligatorio"),
];

export const validateNewAnalist: ValidationChain[] = [
  body("ct_usuario_id")
    .isInt()
    .withMessage("El id del usuario es inválido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("rl_area_financiero_id")
    .optional()
    .isInt()
    .withMessage("El id de la unidad administrativa es inválido"),

  body("estado")
    .isInt()
    .withMessage("El estado es inválido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ct_usuario_in es inválido")
    .notEmpty()
    .withMessage("El ct_usuario_in es obligatorio"),
];

export const validateUpdateAnalist: ValidationChain[] = [
  body("id_puesto_unidad")
    .isInt()
    .withMessage("El id es inválido")
    .notEmpty()
    .withMessage("El id del analista es obligatorio"),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El id del usuario es inválido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("rl_area_financiero_id")
    .optional()
    .isInt()
    .withMessage("El id de la unidad administrativa es inválido"),

  body("estado")
    .isInt()
    .withMessage("El estado es inválido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ct_usuario_in es inválido")
    .notEmpty()
    .withMessage("El ct_usuario_in es obligatorio"),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El ct_usuario_at es inválido"),
];
