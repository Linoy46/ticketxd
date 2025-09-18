import { body, param, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdUser: ValidationChain[] = [
  param("id_usuario")
    .isInt()
    .withMessage("El id es invalido") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),
];

export const validateNewUser: ValidationChain[] = [
  body("nombre_usuario")
    .isString()
    .withMessage("El nombre del usuario es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del usuario es obligatorio"),

  body("contrasena")
    .isString()
    .withMessage("La contraseña es invalida")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),

  body("telefono")
    .isString()
    .withMessage("El telefono es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El telefono es obligatorio"),

  body("email")
    .isEmail()
    .withMessage("El email es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El email es obligatorio"),

  body("email_institucional")
    .optional()
    .isEmail()
    .withMessage("El email institucional es invalido")
    .trim()
    .escape(),

  body("curp")
    .isString()
    .withMessage("La CURP es invalida")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("La CURP es obligatoria"),

  body("estado")
    .isInt()
    .withMessage("El estado es invalido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ct_usuario_in es invalido")
    .notEmpty()
    .withMessage("El ct_usuario_in es obligatorio"),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El ct_usuario_at es invalido")
    .trim()
    .escape(),
];
export const validateUpdateUser: ValidationChain[] = [
  body("id_usuario")
    .isNumeric()
    .withMessage("El id es invalido") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("nombre_usuario")
    .isString()
    .withMessage("El nombre del usuario es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del usuario es obligatorio"),

  body("contrasena")
    .isString()
    .withMessage("La contraseña es invalida")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),

  body("telefono")
    .isString()
    .withMessage("El telefono es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El telefono es obligatorio"),

  body("email")
    .isEmail()
    .withMessage("El email es invalido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El email es obligatorio"),

  body("email_institucional")
    .optional()
    .isEmail()
    .withMessage("El email institucional es invalido")
    .trim()
    .escape(),

  body("curp")
    .isString()
    .withMessage("La CURP es invalida")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("La CURP es obligatoria"),

  body("estado")
    .isBoolean()
    .withMessage("El estado es invalido")
    .notEmpty()
    .withMessage("El estado es obligatorio"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ct_usuario_in es invalido")
    .notEmpty()
    .withMessage("El ct_usuario_in es obligatorio"),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El ct_usuario_at es invalido")
    .trim()
    .escape(),
];
