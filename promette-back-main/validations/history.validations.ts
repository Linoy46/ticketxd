import { body, param,ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdHistory: ValidationChain[] = [
  param("ct_usuario_id")
    .isInt()
    .withMessage("El id de la bitacora es invalido")
    .notEmpty()
    .withMessage("El id de la bitacora es obligatorio"),
];

export const validateNewHistory: ValidationChain[] = [
  body("ct_usuario_id")
    .isInt()
    .withMessage("El id de usuario es invalido")
    .notEmpty()
    .withMessage("El id de usuario es obligatorio"),

  body("ct_accion_id")
    .isInt()
    .withMessage("El id de acción es invalido")
    .notEmpty()
    .withMessage("El id de acción es obligatorio"),

  body("registro_id")
    .isInt()
    .withMessage("El id del registro es invalido")
    .notEmpty()
    .withMessage("El id del registro es obligatorio"),

  body("ct_tabla_id")
    .isInt()
    .withMessage("El id de la tabla es invalido")
    .notEmpty()
    .withMessage("El id de la tabla es obligatorio"),

  body("ct_dispositivo_id")
    .optional()
    .isInt()
    .withMessage("El id de dispositivo es invalido")
    .notEmpty()
    .withMessage("El id de dispositivo es obligatorio"),

  body("estatus_accion")
    .isInt()
    .withMessage("El estatus de la acción es invalido")
    .notEmpty()
    .withMessage("El estatus de la acción es obligatorio"),

  body("detalles_error")
    .optional()
    .isString()
    .withMessage("Los detalles del error son invalidos")
    .trim()
    .escape(),
];
export const validateUpdateHistory: ValidationChain[] = [
  body("id_bitacora")
    .isInt()
    .withMessage("El id de la bitacora es invalido")
    .notEmpty()
    .withMessage("El id de la bitacora es obligatorio"),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El id de usuario es invalido")
    .notEmpty()
    .withMessage("El id de usuario es obligatorio"),

  body("ct_accion_id")
    .isInt()
    .withMessage("El id de acción es invalido")
    .notEmpty()
    .withMessage("El id de acción es obligatorio"),

  body("registro_id")
    .isInt()
    .withMessage("El id del registro es invalido")
    .notEmpty()
    .withMessage("El id del registro es obligatorio"),

  body("ct_tabla_id")
    .isInt()
    .withMessage("El id de la tabla es invalido")
    .notEmpty()
    .withMessage("El id de la tabla es obligatorio"),

  body("ct_dispositivo_id")
    .optional()
    .isInt()
    .withMessage("El id de dispositivo es invalido")
    .notEmpty()
    .withMessage("El id de dispositivo es obligatorio"),

  body("estatus_accion")
    .isInt()
    .withMessage("El estatus de la acción es invalido")
    .notEmpty()
    .withMessage("El estatus de la acción es obligatorio"),

  body("detalles_error")
    .optional()
    .isString()
    .withMessage("Los detalles del error son invalidos")
    .trim()
    .escape(),
];
