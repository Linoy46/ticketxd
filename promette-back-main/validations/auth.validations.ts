import { body, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario
export const validateRegister: ValidationChain[] = [
  body("nombre_usuario")
    .isString()
    .withMessage("El nombre de usuario debe ser una cadena") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio"), // Asegura que el campo no esté vacío

  body("contrasena")
    .isString()
    .withMessage("La contraseña debe ser una cadena") // Verifica que el valor sea una cadena de texto
    .notEmpty()
    .withMessage("La contraseña es obligatoria"), // Asegura que el campo no esté vacío

  body("telefono")
    .optional() // Indica que este campo no es obligatorio
    .isString()
    .withMessage("El teléfono debe ser una cadena") // Verifica que el valor sea una cadena de texto si se proporciona
    .trim() // Elimina espacios en blanco al inicio y al final
    .escape(), // Convierte caracteres especiales en entidades HTML para evitar inyección de código

  body("curp")
    .optional() // Indica que este campo no es obligatorio
    .isString()
    .withMessage("La CURP debe ser una cadena") // Verifica que el valor sea una cadena de texto si se proporciona
    .isLength({ min: 18, max: 18 })
    .withMessage("La CURP debe tener 18 caracteres") // Verifica que la CURP tenga exactamente 18 caracteres
    .trim() // Elimina espacios en blanco al inicio y al final
    .escape(), // Convierte caracteres especiales en entidades HTML para evitar inyección de código
];

// Validaciones para el inicio de sesión
export const validateLogin: ValidationChain[] = [
  body("nombre_usuario")
    .isString()
    .withMessage("El nombre de usuario debe ser una cadena") // Verifica que el valor sea una cadena de texto
    .trim() // Elimina espacios en blanco al inicio y al final de la cadena
    .escape() // Convierte caracteres especiales en entidades HTML para evitar inyección de código
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio"), // Asegura que el campo no esté vacío

  body("contrasena")
    .isString()
    .withMessage("La contraseña debe ser una cadena") // Verifica que el valor sea una cadena de texto
    .notEmpty()
    .withMessage("La contraseña es obligatoria"), // Asegura que el campo no esté vacío
];
export const validateRegisterUser: ValidationChain[] = [
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

  body("curp")
    .isString()
    .withMessage("La CURP es invalida")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("La CURP es obligatoria"),
];
