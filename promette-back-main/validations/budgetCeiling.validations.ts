import { body, param, ValidationChain } from "express-validator";

// Validaciones para obtener techo presupuestal por ID
export const validateIdTecho: ValidationChain[] = [
  param("id_techo")
    .isInt()
    .withMessage("El ID de techo presupuestal es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID de techo presupuestal es obligatorio"),
];

// Validaciones para obtener presupuesto por ID de área
export const validateIdArea: ValidationChain[] = [
  param("id_area")
    .isInt()
    .withMessage("El ID de área es inválido")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),
];

// Validaciones para crear un nuevo techo presupuestal
export const validateNewBudgetCeiling: ValidationChain[] = [
  body("ct_area_id")
    .isInt()
    .withMessage("El ID de área es inválido")
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),

  body("ct_capitulo_id")
    .isInt()
    .withMessage("El ID de capítulo es inválido")
    .notEmpty()
    .withMessage("El ID de capítulo es obligatorio"),

  body("ct_financiamiento_id")
    .isInt()
    .withMessage("El ID de financiamiento es inválido")
    .notEmpty()
    .withMessage("El ID de financiamiento es obligatorio"),

  body("cantidad_presupuestada")
    .isFloat({ min: 0 })
    .withMessage("La cantidad presupuestada debe ser un número positivo")
    .notEmpty()
    .withMessage("La cantidad presupuestada es obligatoria"),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ID de usuario es inválido")
    .notEmpty()
    .withMessage("El ID de usuario es obligatorio"),
];

// Validaciones para actualizar un techo presupuestal
export const validateUpdateBudgetCeiling: ValidationChain[] = [
  param("id_techo")
    .isInt()
    .withMessage("El ID de techo presupuestal es inválido")
    .notEmpty()
    .withMessage("El ID de techo presupuestal es obligatorio"),

  body("ct_area_id")
    .isInt()
    .withMessage("El ID de área es inválido")
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),

  body("ct_capitulo_id")
    .isInt()
    .withMessage("El ID de capítulo es inválido")
    .notEmpty()
    .withMessage("El ID de capítulo es obligatorio"),

  body("ct_financiamiento_id")
    .isInt()
    .withMessage("El ID de financiamiento es inválido")
    .notEmpty()
    .withMessage("El ID de financiamiento es obligatorio"),

  body("cantidad_presupuestada")
    .isFloat({ min: 0 })
    .withMessage("La cantidad presupuestada debe ser un número positivo")
    .notEmpty()
    .withMessage("La cantidad presupuestada es obligatoria"),

  body("ct_usuario_at")
    .isInt()
    .withMessage("El ID de usuario que actualiza es inválido")
    .notEmpty()
    .withMessage("El ID de usuario que actualiza es obligatorio"),
];

// Validaciones para crear requisiciones por lote
export const validateBatchRequisitions: ValidationChain[] = [
  body("dt_techo_id")
    .isInt()
    .withMessage("El ID del techo presupuestal es inválido")
    .notEmpty()
    .withMessage("El ID del techo presupuestal es obligatorio"),

  body("ct_area_id")
    .isInt()
    .withMessage("El ID de área es inválido")
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),

  body("ct_usuarios_in")
    .isInt()
    .withMessage("El ID del usuario es inválido")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio"),

  body("productos")
    .isArray()
    .withMessage("El campo productos debe ser un array")
    .notEmpty()
    .withMessage("Debe incluir al menos un producto"),

  body("productos.*.ct_productos_id")
    .isInt()
    .withMessage("El ID del producto es inválido")
    .notEmpty()
    .withMessage("El ID del producto es obligatorio"),

  body("productos.*.meses")
    .optional()
    .isArray()
    .withMessage("El campo meses debe ser un array"),

  body("productos.*.meses.*.mes")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("El mes debe ser un número entre 1 y 12"),

  body("productos.*.meses.*.cantidad")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),

  body("productos.*.cantidad_total")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La cantidad total debe ser un número positivo"),
];

// Validaciones para crear requisiciones mensuales para un solo producto
export const validateMonthlyRequisitions: ValidationChain[] = [
  body("ct_area_id")
    .isInt()
    .withMessage("El ID de área es inválido")
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El ID del usuario es inválido")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio"),

  body("ct_producto_id")
    .isInt()
    .withMessage("El ID del producto es inválido")
    .notEmpty()
    .withMessage("El ID del producto es obligatorio"),

  body("requisicionesMensuales")
    .isArray()
    .withMessage("Las requisiciones mensuales deben ser un array")
    .notEmpty()
    .withMessage("Debe incluir al menos una requisición mensual"),

  body("requisicionesMensuales.*.mes")
    .isInt({ min: 1, max: 12 })
    .withMessage("El mes debe ser un número entre 1 y 12"),

  body("requisicionesMensuales.*.cantidad")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
];

// Validaciones para crear requisiciones mensuales en bulk para múltiples productos
export const validateBulkMonthlyRequisitions: ValidationChain[] = [
  body("gruposRequisiciones")
    .isArray()
    .withMessage("Los grupos de requisiciones deben ser un array")
    .notEmpty()
    .withMessage("Debe incluir al menos un grupo de requisiciones"),

  body("gruposRequisiciones.*.ct_area_id")
    .isInt()
    .withMessage("El ID de área es inválido")
    .notEmpty()
    .withMessage("El ID de área es obligatorio"),

  body("gruposRequisiciones.*.ct_usuario_id")
    .isInt()
    .withMessage("El ID del usuario es inválido")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio"),

  body("gruposRequisiciones.*.ct_producto_id")
    .isInt()
    .withMessage("El ID del producto es inválido")
    .notEmpty()
    .withMessage("El ID del producto es obligatorio"),

  body("gruposRequisiciones.*.requisicionesMensuales")
    .isArray()
    .withMessage("Las requisiciones mensuales deben ser un array")
    .notEmpty()
    .withMessage("Debe incluir al menos una requisición mensual"),

  body("gruposRequisiciones.*.requisicionesMensuales.*.mes")
    .isInt({ min: 1, max: 12 })
    .withMessage("El mes debe ser un número entre 1 y 12"),

  body("gruposRequisiciones.*.requisicionesMensuales.*.cantidad")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
];