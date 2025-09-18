import { body, param, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdFunction: ValidationChain[] = [
  param("id_funcion")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"), //
];

export const validateNewFunction: ValidationChain[] = [
  body("nombre_funcion")
    .isString()
    .withMessage("El nombre de la función tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre de la función es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),

  body("ct_modulo_id")
    .optional()
    .isInt()
    .withMessage("El módulo debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El módulo es obligatoria"),

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
export const validateUpdateFunction: ValidationChain[] = [
  body("id_funcion")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"),

  body("nombre_funcion")
    .isString()
    .withMessage("El nombre de la función tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre de la función es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),

  body("ct_modulo_id")
    .optional()
    .isInt()
    .withMessage("El área debe ser un número entero") // Corrected field name and type
    .escape()
    .notEmpty()
    .withMessage("El área es obligatoria"),
    
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
