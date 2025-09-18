import { body, param, ValidationChain } from "express-validator";

export const validateIdProject: ValidationChain[] = [
  param("id_proyecto_anual")
    .isInt()
    .withMessage("El id es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El id del proyecto anual es obligatorio"),
];

export const validateNewProject: ValidationChain[] = [
  body("año")
    .isInt()
    .withMessage("El año es inválido")
    .notEmpty()
    .withMessage("El año es obligatorio"),

  body("dt_techo_id")
    .isInt()
    .withMessage("El id del techo presupuestal es inválido")
    .notEmpty()
    .withMessage("El id del techo presupuestal es obligatorio"),
    
  body("monto_asignado")
    .isFloat({ min: 0 })
    .withMessage("El monto asignado debe ser un número mayor o igual a cero")
    .notEmpty()
    .withMessage("El monto asignado es obligatorio"),
    
  body("monto_utilizado")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto utilizado debe ser un número mayor o igual a cero"),
    
  body("monto_disponible")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto disponible debe ser un número mayor o igual a cero"),
    
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser una cadena de texto"),
    
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage("El estado debe ser 0 o 1")
];

export const validateUpdateProject: ValidationChain[] = [
  body("id_proyecto_anual")
    .isInt()
    .withMessage("El id es inválido")
    .notEmpty()
    .withMessage("El id del proyecto anual es obligatorio"),
    
  body("año")
    .optional()
    .isInt()
    .withMessage("El año es inválido"),
    
  body("dt_techo_id")
    .optional()
    .isInt()
    .withMessage("El id del techo presupuestal es inválido"),
    
  body("monto_asignado")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto asignado debe ser un número mayor o igual a cero"),
    
  body("monto_utilizado")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto utilizado debe ser un número mayor o igual a cero"),
    
  body("monto_disponible")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto disponible debe ser un número mayor o igual a cero"),
    
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser una cadena de texto"),
    
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage("El estado debe ser 0 o 1")
];
