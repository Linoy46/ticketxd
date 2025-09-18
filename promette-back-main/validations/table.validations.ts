import { body, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdTable: ValidationChain[] = [
  body("id_tabla")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"), //
];

export const validateNewTable: ValidationChain[] = [
  body("nombre_tabla")
    .isString()
    .withMessage("El nombre de la tabla tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre de la tabla es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),
];
export const validateUpdateTable: ValidationChain[] = [
  body("id_tabla")
    .isNumeric()
    .withMessage("El id tiene que ser un numero") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id es obligatorio"), //

  body("nombre_tabla")
    .isString()
    .withMessage("El nombre de la tabla tiene que ser una cadena") // Corrected field name
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre de la tabla es obligatorio"), // Corrected field name

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción tiene que ser una cadena") // Corrected field name
    .trim()
    .escape(),
];
