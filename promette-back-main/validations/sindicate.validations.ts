import { body, param, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdSindicate: ValidationChain[] = [
  param("id_sindicato")
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .notEmpty() // Asegura que el campo no esté vacío
    .isInt({ min: 1 }) // Asegura que es un número entero y mayor a 0
    .withMessage("El id del sindicato es inválido"),
];

export const validateNewSindicate: ValidationChain[] = [
  param("ct_usuario_in")
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .notEmpty() // Asegura que el campo no esté vacío
    .isInt({ min: 1 }) // Asegura que es un número entero y mayor a 0
    .withMessage("El id de usuario de entrada es inválido"),

  param("ct_usuario_at")
    .optional() // Es opcional, pero si está presente se valida
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .isInt({ min: 1 }) // Si está presente, asegura que sea un número entero positivo
    .withMessage("El id de usuario de actualización es inválido"),
];
export const validateUpdateSindicate: ValidationChain[] = [
  param("id_sindicato")
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .notEmpty() // Asegura que el campo no esté vacío
    .isInt({ min: 1 }) // Asegura que es un número entero y mayor a 0
    .withMessage("El id del sindicato es inválido"),
  param("estado")
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .notEmpty() // Asegura que el campo no esté vacío
    .isInt({ min: 0, max: 1 }) // Asegura que el valor sea 0 o 1
    .withMessage("El estado es inválido, debe ser 0 o 1"),

  param("ct_usuario_in")
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .notEmpty() // Asegura que el campo no esté vacío
    .isInt({ min: 1 }) // Asegura que es un número entero y mayor a 0
    .withMessage("El id de usuario de entrada es inválido"),

  param("ct_usuario_at")
    .optional() // Es opcional, pero si está presente se valida
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML
    .isInt({ min: 1 }) // Si está presente, asegura que sea un número entero positivo
    .withMessage("El id de usuario de actualización es inválido"),
];
