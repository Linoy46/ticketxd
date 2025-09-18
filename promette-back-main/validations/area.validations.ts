import { body, param, ValidationChain } from "express-validator";

export const validateIdArea: ValidationChain[] = [
  param("id_area")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID del área es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El ID del área debe ser un número entero mayor o igual a 1"),
];

export const validateNewArea: ValidationChain[] = [
  body("nombre_area")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre del área es obligatorio")
    .isLength({ min: 3, max: 255 })
    .withMessage("El nombre del área debe tener entre 3 y 255 caracteres"),

  body("indice")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage("El índice no puede exceder los 255 caracteres"),

  body("ct_departamento_id")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID del departamento es obligatorio")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del departamento debe ser un número entero mayor o igual a 1"
    ),

  body("ct_usuario_in")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID del usuario de creación es obligatorio")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del usuario de creación debe ser un número entero mayor o igual a 1"
    ),

  body("ct_usuario_at")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage(
      "El ID del usuario de actualización debe ser un número entero mayor o igual a 1"
    ),
];

export const validateUpdateArea: ValidationChain[] = [
  body("id_area")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID del área es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El ID del área debe ser un número entero mayor o igual a 1"),

  body("nombre_area")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 255 })
    .withMessage("El nombre del área debe tener entre 3 y 255 caracteres"),

  body("indice")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage("El índice no puede exceder los 255 caracteres"),

  body("estado")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El estado es obligatorio")
    .isBoolean()
    .withMessage("El estado debe ser activo o inactivo"),

  body("ct_departamento_id")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage(
      "El ID del departamento debe ser un número entero mayor o igual a 1"
    ),

  body("ct_usuario_at")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID del usuario de actualización es obligatorio")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del usuario de actualización debe ser un número entero mayor o igual a 1"
    ),
];
