import { body, param, query } from "express-validator";

/**
 * Validaciones para el controlador de Producto-Area
 */

// Validación para ID de área financiera
export const validateIdAreaFin = [
  param("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
];

// Validación para ID de producto
export const validateIdProducto = [
  param("id_producto")
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo"),
];

// Validación para ID de restricción producto-área
export const validateIdProductoArea = [
  param("id_producto_area")
    .isInt({ min: 1 })
    .withMessage(
      "El ID de la restricción producto-área debe ser un número entero positivo"
    ),
];

// Validación para crear/restringir producto para área
export const validateRestringirProducto = [
  body("id_producto")
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo"),
  body("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("ct_usuario_in")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// Validación para restringir múltiples productos
export const validateRestringirMultiplesProductos = [
  body("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("productos")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos un producto"),
  body("productos.*")
    .isInt({ min: 1 })
    .withMessage("Cada ID de producto debe ser un número entero positivo"),
  body("ct_usuario_in")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// Validación para revocar/eliminar restricción
export const validateRevocarRestriccion = [
  body("ct_usuario_at")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// Validación para verificar restricción
export const validateVerificarRestriccion = [
  param("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  param("id_producto")
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo"),
];

// Validación para paginación
export const validatePaginacion = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entero entre 1 y 100"),
  query("id_area_fin")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  query("id_producto")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo"),
];

// Validación para actualizar restricción
export const validateActualizarRestriccion = [
  body("id_area_fin")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("id_producto")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo"),
  body("ct_usuario_at")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];
