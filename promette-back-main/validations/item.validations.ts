import { body, param, ValidationChain } from "express-validator";

export const validateIdPartida: ValidationChain[] = [
  param("id_partida")
    .isInt()
    .withMessage("El id_partida es invalido")
    .toInt(),
];

export const validateNewItem: ValidationChain[] = [
  body("ct_capitulo_id")
    .isInt()
    .withMessage("El id del capítulo es inválido")
    .notEmpty()
    .withMessage("El id del capítulo es obligatorio")
    .toInt(),
    
  body("clave_partida")
    .isString()
    .withMessage("La clave de la partida es invalida")
    .trim()
    .isLength({ max: 10 })
    .withMessage("La clave de la partida no debe exceder 10 caracteres")
    .notEmpty()
    .withMessage("La clave de la partida es obligatoria"),

  body("nombre_partida")
    .isString()
    .withMessage("El nombre de la partida es invalido")
    .trim()
    .isLength({ max: 255 })
    .withMessage("El nombre de la partida no debe exceder 255 caracteres")
    .notEmpty()
    .withMessage("El nombre de la partida es obligatorio"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado es inválido")
    .toInt(),
];

export const validateUpdateItem: ValidationChain[] = [
  param("id_partida")
    .isInt()
    .withMessage("El id_partida es invalido")
    .toInt(),
    
  body("ct_capitulo_id")
    .optional()
    .isInt()
    .withMessage("El id del capítulo es inválido")
    .toInt(),
    
  body("clave_partida")
    .optional()
    .isString()
    .withMessage("La clave de la partida es invalida")
    .trim()
    .isLength({ max: 10 })
    .withMessage("La clave de la partida no debe exceder 10 caracteres"),

  body("nombre_partida")
    .optional()
    .isString()
    .withMessage("El nombre de la partida es invalido")
    .trim()
    .isLength({ max: 255 })
    .withMessage("El nombre de la partida no debe exceder 255 caracteres"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado es inválido")
    .toInt(),
];