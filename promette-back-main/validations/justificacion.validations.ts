import { body, param, query, ValidationChain } from "express-validator";

export const validateIdJustificacion: ValidationChain[] = [
  param("id_justificacion")
    .isInt()
    .withMessage("El ID de la justificación debe ser un número entero")
    .notEmpty()
    .withMessage("El ID de la justificación es obligatorio"),
];

export const validateTechoForJustificaciones: ValidationChain[] = [
  param("techo_id")
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del techo presupuestal es obligatorio"),
];

export const validateNewJustificacion: ValidationChain[] = [
  body("ct_partida_id")
    .isInt()
    .withMessage("El ID de la partida debe ser un número entero")
    .notEmpty()
    .withMessage("El ID de la partida es obligatorio"),

  body("ct_area_id")
    .isInt()
    .withMessage("El ID del área financiera debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del área financiera es obligatorio")
    .custom(async (value) => {
      if (value <= 0) {
        throw new Error("El ID del área financiera debe ser mayor a 0");
      }
      return true;
    }),

  // ✅ CORRECCIÓN: Hacer dt_techo_id OBLIGATORIO
  body("dt_techo_id")
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del techo presupuestal es obligatorio")
    .custom(async (value) => {
      if (value <= 1) {
        throw new Error("El ID del techo presupuestal debe ser mayor a 1");
      }
      return true;
    }),

  body("justificacion")
    .isString()
    .withMessage("La justificación debe ser una cadena de texto")
    .notEmpty()
    .withMessage("La justificación es obligatoria")
    .isLength({ min: 10, max: 2000 })
    .withMessage("La justificación debe tener entre 10 y 2000 caracteres"),

  body("ct_usuario_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero"),
];

export const validateUpdateJustificacion: ValidationChain[] = [
  ...validateIdJustificacion,

  body("ct_partida_id")
    .optional()
    .isInt()
    .withMessage("El ID de la partida debe ser un número entero"),

  // ✅ CORRECCIÓN: Actualizar validación para ct_area_id (ahora es id_area_fin)
  body("ct_area_id")
    .optional()
    .isInt()
    .withMessage("El ID del área financiera debe ser un número entero")
    .custom(async (value) => {
      if (value !== undefined && value <= 0) {
        throw new Error("El ID del área financiera debe ser mayor a 0");
      }
      return true;
    }),

  body("dt_techo_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero"),

  body("justificacion")
    .optional()
    .isString()
    .withMessage("La justificación debe ser una cadena de texto")
    .isLength({ min: 10, max: 2000 })
    .withMessage("La justificación debe tener entre 10 y 2000 caracteres"),

  body("ct_usuario_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero"),
];

// ✅ CORRECCIÓN: Actualizar validación para área en rutas de consulta
export const validateAreaForJustificaciones: ValidationChain[] = [
  param("area_id")
    .isInt()
    .withMessage("El ID del área financiera debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del área financiera es obligatorio")
    .custom(async (value) => {
      if (value <= 0) {
        throw new Error("El ID del área financiera debe ser mayor a 0");
      }
      return true;
    }),
];

export const validatePartidaAreaForJustificaciones: ValidationChain[] = [
  param("partida_id")
    .isInt()
    .withMessage("El ID de la partida debe ser un número entero")
    .notEmpty()
    .withMessage("El ID de la partida es obligatorio"),

  // ✅ CORRECCIÓN: Actualizar validación para area_id (ahora es id_area_fin)
  param("area_id")
    .isInt()
    .withMessage("El ID del área financiera debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del área financiera es obligatorio")
    .custom(async (value) => {
      if (value <= 0) {
        throw new Error("El ID del área financiera debe ser mayor a 0");
      }
      return true;
    }),

  query("techo_id")
    .optional()
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero"),
];

export const validateUpsertJustificacion: ValidationChain[] = [
  body("ct_partida_id")
    .isInt()
    .withMessage("El ID de la partida debe ser un número entero")
    .notEmpty()
    .withMessage("El ID de la partida es obligatorio"),

  body("ct_area_id")
    .isInt()
    .withMessage("El ID del área financiera debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del área financiera es obligatorio")
    .custom(async (value) => {
      if (value <= 0) {
        throw new Error("El ID del área financiera debe ser mayor a 0");
      }
      return true;
    }),

  // ✅ CORRECCIÓN: Hacer dt_techo_id OBLIGATORIO también en upsert
  body("dt_techo_id")
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del techo presupuestal es obligatorio")
    .custom(async (value) => {
      if (value <= 1) {
        throw new Error("El ID del techo presupuestal debe ser mayor a 1");
      }
      return true;
    }),

  body("justificacion")
    .isString()
    .withMessage("La justificación debe ser una cadena de texto")
    .notEmpty()
    .withMessage("La justificación es obligatoria")
    .isLength({ min: 10, max: 2000 })
    .withMessage("La justificación debe tener entre 10 y 2000 caracteres"),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio"),
];

export const validateMassiveJustificacion: ValidationChain[] = [
  body("justificaciones")
    .isArray()
    .withMessage("Las justificaciones deben ser un array")
    .notEmpty()
    .withMessage("Debe proporcionar al menos una justificación"),

  body("justificaciones.*.ct_partida_id")
    .isInt()
    .withMessage("Cada ID de partida debe ser un número entero"),

  // ✅ CORRECCIÓN: Actualizar validación masiva para ct_area_id (ahora es id_area_fin)
  body("justificaciones.*.ct_area_id")
    .isInt()
    .withMessage("Cada ID de área financiera debe ser un número entero")
    .custom(async (value) => {
      if (value <= 0) {
        throw new Error("Cada ID de área financiera debe ser mayor a 0");
      }
      return true;
    }),

  body("justificaciones.*.dt_techo_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Cada ID de techo presupuestal debe ser un número entero"),

  body("justificaciones.*.justificacion")
    .isString()
    .withMessage("Cada justificación debe ser una cadena de texto")
    .notEmpty()
    .withMessage("Cada justificación es obligatoria")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Cada justificación debe tener entre 10 y 2000 caracteres"),

  body("justificaciones.*.ct_usuario_id")
    .isInt()
    .withMessage("Cada ID de usuario debe ser un número entero"),
];
