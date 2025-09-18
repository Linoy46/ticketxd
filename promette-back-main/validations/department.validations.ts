import { body, param, ValidationChain } from "express-validator";

export const validateIdDepartment: ValidationChain[] = [
  param("id_departamento")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id del departamento es inválido"),
];

export const validateNewDepartment: ValidationChain[] = [
  body("nombre_departamento")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 150 })
    .withMessage("El nombre del departamento debe tener entre 3 y 150 caracteres"),

  body("ct_direccion_id")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 0 })
    .withMessage("El id de dirección es inválido"),

  body("ct_usuario_in")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id de usuario de entrada es inválido"),

  body("ct_usuario_at")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("El id de usuario de actualización es inválido"),
];

export const validateUpdateDepartment: ValidationChain[] = [
  body("id_departamento")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id del departamento es inválido"),

  body("nombre_departamento")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 150 })
    .withMessage("El nombre del departamento debe tener entre 3 y 150 caracteres"),

  body("ct_direccion_id")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("El id de dirección es inválido"),

  body("ct_usuario_at")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("El id de usuario de actualización es inválido"),
];
