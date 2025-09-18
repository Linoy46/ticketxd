import { body, param, query } from "express-validator";

/**
 * Validaciones para el controlador de Partida-Area
 * ✅ ACTUALIZADO: Usa id_area_fin como primary key de rl_area_financiero
 */

// ✅ CAMBIO: Validación para ID de área financiera (primary key)
export const validateIdAreaFin = [
  param("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
];

// Validación para ID de partida
export const validateIdPartida = [
  param("id_partida")
    .isInt({ min: 1 })
    .withMessage("El ID de la partida debe ser un número entero positivo"),
];

// Validación para ID de relación partida-área
export const validateIdPartidaArea = [
  param("id_partida_area")
    .isInt({ min: 1 })
    .withMessage(
      "El ID de la relación partida-área debe ser un número entero positivo"
    ),
];

// ✅ CAMBIO: Validación para crear/asignar partida a área (usando id_area_fin)
export const validateAsignarPartida = [
  body("id_partida")
    .isInt({ min: 1 })
    .withMessage("El ID de la partida debe ser un número entero positivo"),
  body("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("ct_usuario_in")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// ✅ CAMBIO: Validación para asignar múltiples partidas (usando id_area_fin)
export const validateAsignarMultiplesPartidas = [
  body("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("partidas")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos una partida"),
  body("partidas.*")
    .isInt({ min: 1 })
    .withMessage("Cada ID de partida debe ser un número entero positivo"),
  body("ct_usuario_in")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// Validación para revocar/eliminar partida
export const validateRevocarPartida = [
  body("ct_usuario_at")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];

// ✅ CAMBIO: Validación para verificar acceso (usando id_area_fin)
export const validateVerificarAcceso = [
  param("id_area_fin")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  param("id_partida")
    .isInt({ min: 1 })
    .withMessage("El ID de la partida debe ser un número entero positivo"),
];

// ✅ CAMBIO: Validación para paginación (usando id_area_fin)
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
  query("id_partida")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la partida debe ser un número entero positivo"),
];

// ✅ CAMBIO: Validación para actualizar relación (usando id_area_fin)
export const validateActualizarRelacion = [
  body("id_area_fin")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "El ID del área financiera debe ser un número entero positivo"
    ),
  body("id_partida")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la partida debe ser un número entero positivo"),
  body("ct_usuario_at")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
];
