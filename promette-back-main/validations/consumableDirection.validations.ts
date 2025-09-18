import { body, param, ValidationChain } from "express-validator";

export const validateIdDireccion: ValidationChain[] = [
  param("id_direccion")
    .isInt()
    .withMessage("El id_direccion es invalido")
    .notEmpty()
    .withMessage("El id_direccion es obligatorio"),
];

export const validateNewConsumableDirection: ValidationChain[] = [
  body("nombre_direccion")
    .isString()
    .withMessage("El nombre de la dirección es invalido")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la dirección es obligatorio"),

  body("ct_puesto_id")
    .isInt()
    .withMessage("El id del puesto es invalido")
    .notEmpty()
    .withMessage("El id del puesto es obligatorio"),
];

export const validateUpdateConsumableDirection: ValidationChain[] = [
  ...validateIdDireccion,
  ...validateNewConsumableDirection,
];
