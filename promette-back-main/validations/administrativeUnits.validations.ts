import { body, param, ValidationChain } from "express-validator";

export const validateIdAdministrativeUnit: ValidationChain[] = [
  param("id_area_fin")
    .isInt()
    .withMessage("El id es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El id de la unidad administrativa es obligatorio"),
];

export const validateNewAdministrativeUnit: ValidationChain[] = [
  body("id_financiero")
    .isInt()
    .withMessage("El id financiero es inválido")
    .notEmpty()
    .withMessage("El id financiero es obligatorio"),

  body("id_area_infra")
    .isInt()
    .withMessage("El id del área infraestructura es inválido")
    .notEmpty()
    .withMessage("El id del área infraestructura es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El id del usuario creador es inválido")
    .notEmpty()
    .withMessage("El id del usuario creador es obligatorio"),
];

export const validateUpdateAdministrativeUnit: ValidationChain[] = [
  body("id_area_fin")
    .isInt()
    .withMessage("El id es inválido")
    .notEmpty()
    .withMessage("El id de la unidad administrativa es obligatorio"),

  body("id_financiero")
    .isInt()
    .withMessage("El id financiero es inválido")
    .notEmpty()
    .withMessage("El id financiero es obligatorio"),

  body("id_area_infra")
    .isInt()
    .withMessage("El id del área infraestructura es inválido")
    .notEmpty()
    .withMessage("El id del área infraestructura es obligatorio"),

  body("ct_usuario_at")
    .isInt()
    .withMessage("El id del usuario actualizador es inválido")
    .notEmpty()
    .withMessage("El id del usuario actualizador es obligatorio"),
];
