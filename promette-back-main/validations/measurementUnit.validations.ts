import { body, param, ValidationChain } from "express-validator";

export const validateIdUnidad: ValidationChain[] = [
  param("id_unidad")
    .isInt()
    .withMessage("El id_unidad es invalido")
    .notEmpty()
    .withMessage("El id_unidad es obligatorio"),
];

export const validateNewMeasurementUnit: ValidationChain[] = [
  body("clave_unidad")
    .isString()
    .withMessage("La clave de la unidad es invalida")
    .trim()
    .isLength({ max: 4 })
    .withMessage("La clave de la unidad no debe exceder 4 caracteres"),

  body("nombre_unidad")
    .isString()
    .withMessage("El nombre de la unidad es invalido")
    .trim()
    .isLength({ max: 100 })
    .withMessage("El nombre de la unidad no debe exceder 100 caracteres"),
];

export const validateUpdateMeasurementUnit: ValidationChain[] = [
  ...validateIdUnidad,
  ...validateNewMeasurementUnit,
];
