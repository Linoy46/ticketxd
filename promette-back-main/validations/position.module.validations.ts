import { body, ValidationChain } from "express-validator"; // Importamos las funciones necesarias de express-validator

// Validaciones para el registro de un nuevo usuario

export const validateIdPositionModule: ValidationChain[] = [
  body("id_puesto_modulo")
    .isInt()
    .withMessage("El id de puesto modulo es invalido")
    .notEmpty()
    .withMessage("El id de puesto modulo es obligatorio")
    .trim()
    .escape(),
];

export const validateNewPositionModule: ValidationChain[] = [
  body("ct_puesto_id")
    .optional()
    .isInt()
    .withMessage("El id de puesto es invalido")
    .notEmpty()
    .withMessage("El id de puesto es obligatorio")
    .trim()
    .escape(),

  body("ct_modulo_id")
    .optional()
    .isInt()
    .withMessage("El id de módulo es invalido")
    .notEmpty()
    .withMessage("El id de módulo es obligatorio")
    .trim()
    .escape(),

  body("func_agregar")
    .optional()
    .isInt()
    .withMessage("La función de agregar es invalida")
    .notEmpty()
    .withMessage("La función de agregar es obligatoria")
    .trim()
    .escape(),

  body("func_editar")
    .optional()
    .isInt()
    .withMessage("La función de editar es invalida")
    .notEmpty()
    .withMessage("La función de editar es obligatoria")
    .trim()
    .escape(),

  body("func_eliminar")
    .optional()
    .isInt()
    .withMessage("La función de eliminar es invalida")
    .notEmpty()
    .withMessage("La función de eliminar es obligatoria")
    .trim()
    .escape(),

  body("func_buscar")
    .optional()
    .isInt()
    .withMessage("La función de buscar es invalida")
    .notEmpty()
    .withMessage("La función de buscar es obligatoria")
    .trim()
    .escape(),

  body("func_imprimir")
    .optional()
    .isInt()
    .withMessage("La función de imprimir es invalida")
    .notEmpty()
    .withMessage("La función de imprimir es obligatoria")
    .trim()
    .escape(),

  body("func_subir")
    .optional()
    .isInt()
    .withMessage("La función de subir es invalida")
    .notEmpty()
    .withMessage("La función de subir es obligatoria")
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
export const validateUpdatePositionModule: ValidationChain[] = [
  body("id_puesto_modulo")
    .isInt()
    .withMessage("El id de puesto modulo es invalido")
    .notEmpty()
    .withMessage("El id de puesto modulo es obligatorio")
    .trim()
    .escape(),
  body("ct_puesto_id")
    .optional()
    .isInt()
    .withMessage("El id de puesto es invalido")
    .notEmpty()
    .withMessage("El id de puesto es obligatorio")
    .trim()
    .escape(),

  body("ct_modulo_id")
    .optional()
    .isInt()
    .withMessage("El id de módulo es invalido")
    .notEmpty()
    .withMessage("El id de módulo es obligatorio")
    .trim()
    .escape(),

  body("func_agregar")
    .optional()
    .isInt()
    .withMessage("La función de agregar es invalida")
    .notEmpty()
    .withMessage("La función de agregar es obligatoria")
    .trim()
    .escape(),

  body("func_editar")
    .optional()
    .isInt()
    .withMessage("La función de editar es invalida")
    .notEmpty()
    .withMessage("La función de editar es obligatoria")
    .trim()
    .escape(),

  body("func_eliminar")
    .optional()
    .isInt()
    .withMessage("La función de eliminar es invalida")
    .notEmpty()
    .withMessage("La función de eliminar es obligatoria")
    .trim()
    .escape(),

  body("func_buscar")
    .optional()
    .isInt()
    .withMessage("La función de buscar es invalida")
    .notEmpty()
    .withMessage("La función de buscar es obligatoria")
    .trim()
    .escape(),

  body("func_imprimir")
    .optional()
    .isInt()
    .withMessage("La función de imprimir es invalida")
    .notEmpty()
    .withMessage("La función de imprimir es obligatoria")
    .trim()
    .escape(),

  body("func_subir")
    .optional()
    .isInt()
    .withMessage("La función de subir es invalida")
    .notEmpty()
    .withMessage("La función de subir es obligatoria")
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
