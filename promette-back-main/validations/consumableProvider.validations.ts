import { body, param, ValidationChain } from "express-validator";

export const validateIdProveedor: ValidationChain[] = [
  param("id_proveedor")
    .isInt()
    .withMessage("El id_proveedor es invalido")
    .notEmpty()
    .withMessage("El id_proveedor es obligatorio"),
];

export const validateNewConsumableProvider: ValidationChain[] = [
  body("razon_social")
    .isString()
    .withMessage("La razón social es invalida")
    .trim()
    .notEmpty()
    .withMessage("La razón social es obligatoria"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado es invalido"),
];

export const validateUpdateConsumableProvider: ValidationChain[] = [
  ...validateIdProveedor,
  ...validateNewConsumableProvider,
];
