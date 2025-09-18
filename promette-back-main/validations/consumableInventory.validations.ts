import { body, param, ValidationChain } from "express-validator";

export const validateIdInventario: ValidationChain[] = [
  param("id_inventario")
    .isInt()
    .withMessage("El id_inventario es invalido")
    .notEmpty()
    .withMessage("El id_inventario es obligatorio"),
];

export const validateNewConsumableInventory: ValidationChain[] = [
  body("descripcion")
    .not()
    .isEmpty()
    .withMessage("La descripción es obligatoria")
    .isString()
    .withMessage("La descripción es invalida")
    .trim(),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("Las observaciones deben ser texto")
    .isLength({ max: 255 })
    .withMessage("Las observaciones no pueden exceder 255 caracteres")
    .trim(),

  body("cantidad")
    .isNumeric()
    .withMessage("La cantidad debe ser un número")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),

  body("ct_partida_id")
    .isNumeric()
    .withMessage("El ID de partida es obligatorio y debe ser un número")
    .notEmpty()
    .withMessage("El id de la partida es obligatorio"),

  body("ct_unidad_id")
    .isNumeric()
    .withMessage("El ID de unidad es obligatorio y debe ser un número")
    .notEmpty()
    .withMessage("El id de la unidad es obligatorio"),

  body("ct_factura_id")
    .isNumeric()
    .withMessage("El ID de factura es obligatorio y debe ser un número")
    .notEmpty()
    .withMessage("El id de la factura es obligatorio"),
];

export const validateUpdateConsumableInventory: ValidationChain[] = [
  ...validateIdInventario,
  ...validateNewConsumableInventory,
];

export const validateBatchConsumableInventory: ValidationChain[] = [
  body("items")
    .isArray()
    .withMessage("Se requiere un array de elementos para crear el lote")
    .notEmpty()
    .withMessage("El array de elementos no puede estar vacío"),

  body("items.*.descripcion")
    .not()
    .isEmpty()
    .withMessage("La descripción es obligatoria")
    .isString()
    .withMessage("La descripción es invalida")
    .trim(),

  body("items.*.observaciones")
    .optional()
    .isString()
    .withMessage("Las observaciones deben ser texto")
    .isLength({ max: 255 })
    .withMessage("Las observaciones no pueden exceder 255 caracteres")
    .trim(),

  body("items.*.cantidad")
    .isInt()
    .withMessage("La cantidad debe ser un número entero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),

  body("items.*.ct_partida_id")
    .isInt()
    .withMessage("El id de la partida es invalido")
    .notEmpty()
    .withMessage("El id de la partida es obligatorio"),

  body("items.*.ct_unidad_id")
    .isInt()
    .withMessage("El id de la unidad es invalido")
    .notEmpty()
    .withMessage("El id de la unidad es obligatorio"),

  body("items.*.ct_factura_id")
    .isInt()
    .withMessage("El id de la factura es invalido")
    .notEmpty()
    .withMessage("El id de la factura es obligatorio"),
];
