import { body, param, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdPosition: ValidationChain[] = [
  param("id_puesto")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"), //
];

export const validateNewPosition: ValidationChain[] = [
  body("nombre_puesto")
    .isString()
    .withMessage("El nombre del puesto tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del puesto es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),

  body("ct_area_id")
    .optional()
    .isInt()
    .withMessage("El área debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El área es obligatoria"),

  body("ct_puesto_superior_id")
    .optional()
    .isInt()
    .withMessage("El puesto superior debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El puesto superior es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El usuario de entrada debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El usuario de entrada es obligatorio"),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El usuario de actualización debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El usuario de actualización es obligatorio"),
];
export const validateUpdatePosition: ValidationChain[] = [
  body("id_puesto")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"),

  body("nombre_puesto")
    .isString()
    .withMessage("El nombre del puesto tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del puesto es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),

  body("ct_area_id")
    .optional()
    .isInt()
    .withMessage("El área debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El área es obligatoria"),

  body("ct_puesto_superior_id")
    .optional()
    .isInt()
    .withMessage("El puesto superior debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El puesto superior es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El usuario de entrada debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El usuario de entrada es obligatorio"),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El usuario de actualización debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El usuario de actualización es obligatorio"),

  body("estado")
    .optional()
    .isInt()
    .withMessage("El estado debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El estado es obligatoria"),
];
