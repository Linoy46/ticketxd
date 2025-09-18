import { body, param, ValidationChain } from "express-validator";

export const validateIdModule: ValidationChain[] = [
  param("id_modulo")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid module ID"),
];

export const validateNewModule: ValidationChain[] = [
  body("nombre_modulo")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage("Module name must be between 3 and 100 characters"),

  body("ct_modulo_padre_id")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Invalid parent module ID"),

  body("ct_usuario_in")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
];

export const validateUpdateModule: ValidationChain[] = [
  body("id_modulo")
    .trim()
    .escape()
    .notEmpty()
    .isInt({ min: 5 })
    .withMessage("Invalid module ID"),

  body("nombre_modulo")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 100 })
    .withMessage("Module name must be between 3 and 100 characters"),

  body("modulo_padre")
    .optional()
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Invalid parent module ID"),


 

  body("ct_usuario_at")
    .trim()
    .escape()
    .notEmpty()
    .isString()
    .withMessage("Invalid user ID"),
];
