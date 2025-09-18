import { body, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdModuleArea: ValidationChain[] = [
  body("id_modulo_area")
    .isInt()
    .withMessage("El id del módulo asignado es invalido")
    .notEmpty()
    .withMessage("El id del módulo asignado es obligatorio")
    .trim()
    .escape(),
];

export const validateNewModuleArea: ValidationChain[] = [
  body("ct_modulo_id")
    .isInt()
    .withMessage("El id del módulo es invalido")
    .notEmpty()
    .withMessage("El id del módulo es obligatorio")
    .trim()
    .escape(),

  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es invalido")
    .notEmpty()
    .withMessage("El id del área es obligatorio")
    .trim()
    .escape(),
];
export const validateUpdateModuleArea: ValidationChain[] = [
  body("id_modulo_area")
    .isInt()
    .withMessage("El id del módulo asignado es invalido")
    .notEmpty()
    .withMessage("El id del módulo asignado es obligatorio")
    .trim()
    .escape(),

  body("ct_modulo_id")
    .isInt()
    .withMessage("El id del módulo es invalido")
    .notEmpty()
    .withMessage("El id del módulo es obligatorio")
    .trim()
    .escape(),

  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es invalido")
    .notEmpty()
    .withMessage("El id del área es obligatorio")
    .trim()
    .escape(),
];
