import { body, param, ValidationChain } from "express-validator";

export const validateIdRequisicion: ValidationChain[] = [
  param("id_producto_requisicion")
    .isInt()
    .withMessage("El id de la requisición es inválido")
    .notEmpty()
    .withMessage("El id de la requisición es obligatorio")
    .toInt(), // Convertir explícitamente a entero
];

// Nueva validación para ID de área
export const validateIdArea: ValidationChain[] = [
  param("area_id")
    .isInt()
    .withMessage("El ID del área es inválido")
    .notEmpty()
    .withMessage("El ID del área es obligatorio"),
];

// Validación para requisición individual (POST a /requisition)
export const validateNewRequisition: ValidationChain[] = [
  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es invalido")
    .notEmpty()
    .withMessage("El id del área es obligatorio"),

  body("dt_techo_id")
    .isInt()
    .withMessage("El id del techo presupuestal es invalido")
    .notEmpty()
    .withMessage("El id del techo presupuestal es obligatorio"),

  body("ct_productos_id")
    .isInt()
    .withMessage("El id del producto es invalido")
    .notEmpty()
    .withMessage("El id del producto es obligatorio"),

  body("cantidad")
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),

  // Validación para el mes
  body("mes")
    .isString()
    .withMessage("El mes debe ser una cadena de texto")
    .isLength({ min: 1, max: 2 })
    .withMessage("El mes debe tener entre 1 y 2 caracteres")
    .notEmpty()
    .withMessage("El mes es obligatorio"),

  body("ct_usuarios_in")
    .isInt()
    .withMessage("El id del usuario es invalido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("ct_usuarios_at")
    .optional({ nullable: true })
    .isInt()
    .withMessage("El id del usuario que aprueba debe ser un número entero"),
];

// Validación específica para requisiciones múltiples (POST a /requisition/batch)
export const validateMultipleRequisition: ValidationChain[] = [
  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es invalido")
    .notEmpty()
    .withMessage("El id del área es obligatorio"),

  body("dt_techo_id")
    .isInt()
    .withMessage("El id del techo presupuestal es invalido")
    .notEmpty()
    .withMessage("El id del techo presupuestal es obligatorio"),

  body("ct_usuarios_in")
    .isInt()
    .withMessage("El id del usuario es invalido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("productos")
    .isArray()
    .withMessage("Los productos deben ser un arreglo")
    .notEmpty()
    .withMessage("Los productos son obligatorios"),

  body("productos.*.ct_productos_id")
    .isInt()
    .withMessage("El id del producto es invalido")
    .notEmpty()
    .withMessage("El id del producto es obligatorio"),

  body("productos.*.cantidad")
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),

  // Validación para el mes
  body("productos.*.mes")
    .isString()
    .withMessage("El mes debe ser una cadena de texto")
    .isLength({ min: 1, max: 2 })
    .withMessage("El mes debe tener entre 1 y 2 caracteres")
    .notEmpty()
    .withMessage("El mes es obligatorio"),
];

export const validateUpdateRequisition: ValidationChain[] = [
  param("id_producto_requisicion")
    .isInt()
    .withMessage("El id de la requisición es inválido")
    .notEmpty()
    .withMessage("El id de la requisición es obligatorio"),

  body("ct_area_id")
    .optional()
    .isInt()
    .withMessage("El id del área es invalido"),

  body("dt_techo_id")
    .optional()
    .isInt()
    .withMessage("El id del techo presupuestal es invalido"),

  body("ct_productos_id")
    .optional()
    .isInt()
    .withMessage("El id del producto es invalido"),

  body("cantidad")
    .optional()
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero"),

  // Validación para el mes
  body("mes")
    .optional()
    .isString()
    .withMessage("El mes debe ser una cadena de texto")
    .isLength({ min: 1, max: 2 })
    .withMessage("El mes debe tener entre 1 y 2 caracteres"),

  body("ct_usuarios_in")
    .optional()
    .isInt()
    .withMessage("El id del usuario es invalido"),

  body("ct_usuarios_at")
    .optional({ nullable: true })
    .isInt()
    .withMessage("El id del usuario que aprueba debe ser un número entero"),
];

// Validación para requisiciones mensuales
export const validateMonthlyRequisitions: ValidationChain[] = [
  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es inválido")
    .notEmpty()
    .withMessage("El id del área es obligatorio"),

  body("dt_techo_id")
    .isInt()
    .withMessage("El id del techo presupuestal es invalido")
    .notEmpty()
    .withMessage("El id del techo presupuestal es obligatorio"),

  body("ct_usuarios_in")
    .isInt()
    .withMessage("El id del usuario es inválido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("ct_productos_id")
    .isInt()
    .withMessage("El id del producto es inválido")
    .notEmpty()
    .withMessage("El id del producto es obligatorio"),

  body("requisicionesMensuales")
    .isArray()
    .withMessage("Las requisiciones mensuales deben ser un arreglo")
    .notEmpty()
    .withMessage("Debe proporcionar al menos una requisición mensual"),

  body("requisicionesMensuales.*.mes")
    .isString()
    .withMessage("El mes debe ser una cadena de texto")
    .isLength({ min: 1, max: 2 })
    .withMessage("El mes debe tener entre 1 y 2 caracteres")
    .notEmpty()
    .withMessage("El mes es obligatorio"),

  body("requisicionesMensuales.*.cantidad")
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),
];

// Validación para múltiples grupos de requisiciones mensuales
export const validateBulkMonthlyRequisitions: ValidationChain[] = [
  body("gruposRequisiciones")
    .isArray()
    .withMessage("Los grupos de requisiciones deben ser un arreglo")
    .notEmpty()
    .withMessage("Debe proporcionar al menos un grupo de requisiciones"),

  body("gruposRequisiciones.*.ct_area_id")
    .isInt()
    .withMessage("El ID del área debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del área es obligatorio"),

  body("gruposRequisiciones.*.dt_techo_id")
    .isInt()
    .withMessage("El ID del techo presupuestal debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del techo presupuestal es obligatorio"),

  body("gruposRequisiciones.*.ct_usuarios_in")
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio"),

  body("gruposRequisiciones.*.ct_productos_id")
    .isInt()
    .withMessage("El ID del producto debe ser un número entero")
    .notEmpty()
    .withMessage("El ID del producto es obligatorio"),

  body("gruposRequisiciones.*.requisicionesMensuales")
    .isArray()
    .withMessage("Las requisiciones mensuales deben ser un arreglo")
    .notEmpty()
    .withMessage("Debe proporcionar al menos una requisición mensual"),

  body("gruposRequisiciones.*.requisicionesMensuales.*.mes")
    .isString()
    .withMessage("El mes debe ser una cadena de texto")
    .isLength({ min: 1, max: 2 })
    .withMessage("El mes debe tener entre 1 y 2 caracteres")
    .notEmpty()
    .withMessage("El mes es obligatorio"),

  body("gruposRequisiciones.*.requisicionesMensuales.*.cantidad")
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),
];

// Validación para requisiciones unificadas
export const validateUnifiedRequisition: ValidationChain[] = [
  body("dt_techo_id")
    .isInt()
    .withMessage("El id del techo presupuestal es inválido")
    .notEmpty()
    .withMessage("El id del techo presupuestal es obligatorio"),

  body("ct_area_id")
    .isInt()
    .withMessage("El id del área es inválido")
    .notEmpty()
    .withMessage("El id del área es obligatorio"),

  body("ct_usuario_id")
    .isInt()
    .withMessage("El id del usuario es inválido")
    .notEmpty()
    .withMessage("El id del usuario es obligatorio"),

  body("productos")
    .isArray()
    .withMessage("Los productos deben ser un arreglo")
    .notEmpty()
    .withMessage("Los productos son obligatorios"),

  body("productos.*.ct_productos_id")
    .isInt()
    .withMessage("El id del producto es inválido")
    .notEmpty()
    .withMessage("El id del producto es obligatorio"),

  body("productos.*.meses")
    .isArray()
    .withMessage("Los meses deben ser un arreglo")
    .notEmpty()
    .withMessage("Los meses son obligatorios"),

  body("productos.*.meses.*.mes")
    .isInt({ min: 1, max: 12 })
    .withMessage("El mes debe ser un número entre 1 y 12")
    .notEmpty()
    .withMessage("El mes es obligatorio"),

  body("productos.*.meses.*.cantidad")
    .isFloat({ min: 0.001 })
    .withMessage("La cantidad debe ser un número mayor que cero")
    .notEmpty()
    .withMessage("La cantidad es obligatoria"),
];
