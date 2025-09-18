import { body, param, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdUserPosition: ValidationChain[] = [
  param("id_usuario_puesto")
    .isInt()
    .withMessage("El id del puesto asignado es invalido")
    .notEmpty()
    .withMessage("El id del puesto asignado es obligatorio")
    .trim()
    .escape(),
];

export const validateNewUserPosition: ValidationChain[] = [
  body("ct_usuario_id")
    .isInt()
    .withMessage("El id de usuario es invalido")
    .notEmpty()
    .withMessage("El id de usuario es obligatorio")
    .trim()
    .escape(),

  body("ct_puesto_id")
    .isInt()
    .withMessage("El id de puesto es invalido")
    .notEmpty()
    .withMessage("El id de puesto es obligatorio")
    .trim()
    .escape(),

  body("periodo_inicio")
    .isString()
    .withMessage("La fecha de inicio es invalida")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .trim()
    .escape(),

  body("periodo_final")
    .optional({ nullable: true })
    .isString()
    .withMessage("La fecha de fin es invalida")
    .trim()
    .escape(),

  body("plaza")
    .isString()
    .withMessage("La plaza es invalida")
    .notEmpty()
    .withMessage("La plaza es obligatoria")
    .trim()
    .escape(),

  body("ct_sindicato_id")
    .isInt()
    .withMessage("El sindicato es invalido")
    .notEmpty()
    .withMessage("El sindicato es obligatorio")
    .trim()
    .escape(),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El id del usuario de creación es invalido")
    .notEmpty()
    .withMessage("El id del usuario de creación es obligatorio")
    .trim()
    .escape(),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El id del usuario de actualización es invalido")
    .notEmpty()
    .withMessage("El id del usuario de actualización es obligatorio")
    .trim()
    .escape(),
];
export const validateUpdateUserPosition: ValidationChain[] = [
  body("id_usuario_puesto")
    .isInt()
    .withMessage("El id del puesto asignado es invalido")
    .notEmpty()
    .withMessage("El id del puesto asignado es obligatorio")
    .trim()
    .escape(),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El id de usuario es invalido")
    .notEmpty()
    .withMessage("El id de usuario es obligatorio")
    .trim()
    .escape(),

  body("ct_puesto_id")
    .isInt()
    .withMessage("El id de puesto es invalido")
    .notEmpty()
    .withMessage("El id de puesto es obligatorio")
    .trim()
    .escape(),

  body("periodo_inicio")
    .isString()
    .withMessage("La fecha de inicio es invalida")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .trim()
    .escape(),

  body("periodo_final")
    .optional()
    .isString()
    .withMessage("La fecha de fin es invalida")
    .trim()
    .escape(),

  body("plaza")
    .isString()
    .withMessage("La plaza es invalida")
    .notEmpty()
    .withMessage("La plaza es obligatoria")
    .trim()
    .escape(),

  body("ct_sindicato_id")
    .isInt()
    .withMessage("El sindicato es invalido")
    .notEmpty()
    .withMessage("El sindicato es obligatorio")
    .trim()
    .escape(),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El id del usuario de creación es invalido")
    .notEmpty()
    .withMessage("El id del usuario de creación es obligatorio")
    .trim()
    .escape(),

  body("ct_usuario_at")
    .optional()
    .isInt()
    .withMessage("El id del usuario de actualización es invalido")
    .notEmpty()
    .withMessage("El id del usuario de actualización es obligatorio")
    .trim()
    .escape(),
];
