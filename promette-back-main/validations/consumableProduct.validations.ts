import { body, param, ValidationChain } from "express-validator";

export const validateIdProducto: ValidationChain[] = [
  param("id_producto")
    .isInt()
    .withMessage("El id_producto es invalido")
    .notEmpty()
    .withMessage("El id_producto es obligatorio"),
];

export const validateNewConsumableProduct: ValidationChain[] = [
  body("nombre_producto")
    .isString()
    .withMessage("El nombre del producto es invalido")
    .trim()
    .isLength({ max: 500 })
    .withMessage("El nombre del producto no debe exceder 100 caracteres")
    .notEmpty()
    .withMessage("El nombre del producto es obligatorio"),

  body("precio")
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage("El precio debe ser un valor decimal válido")
    .optional({ nullable: true }),

  body("ct_unidad_id")
    .isInt()
    .withMessage("El id de la unidad de medida es invalido")
    .notEmpty()
    .withMessage("El id de la unidad de medida es obligatorio"),

  body("estado")
    .isBoolean()
    .withMessage("El estado es invalido")
    .optional(),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El id del usuario que registra es invalido")
    .notEmpty()
    .withMessage("El id del usuario que registra es obligatorio"),

  body("ct_usuario_at")
    .isInt()
    .withMessage("El id del usuario que actualiza es invalido")
    .optional({ nullable: true }),

  body("ct_partida_id")
    .isInt()
    .withMessage("El id de la partida es invalido")
    .notEmpty()
    .withMessage("El id de la partida es obligatorio"),
];

export const validateUpdateConsumableProduct: ValidationChain[] = [
  ...validateIdProducto,
  ...validateNewConsumableProduct,
];
