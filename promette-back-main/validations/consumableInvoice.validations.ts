import { body, param, ValidationChain } from "express-validator";

export const validateIdFactura: ValidationChain[] = [
  param("id_factura")
    .isInt()
    .withMessage("El id_factura es invalido")
    .notEmpty()
    .withMessage("El id_factura es obligatorio"),
];

export const validateNewConsumableInvoice: ValidationChain[] = [
  body("factura")
    .isString()
    .withMessage("El número de factura es invalido")
    .trim()
    .notEmpty()
    .withMessage("El número de factura es obligatorio"),

  body("ct_provedor_id")
    .isInt()
    .withMessage("El id del proveedor es invalido")
    .notEmpty()
    .withMessage("El id del proveedor es obligatorio"),
];

export const validateUpdateConsumableInvoice: ValidationChain[] = [
  ...validateIdFactura,
  ...validateNewConsumableInvoice,
];
