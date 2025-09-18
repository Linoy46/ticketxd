import { Router } from "express";
import {
  getAllJustificaciones,
  getJustificacionById,
  getJustificacionesByPartida,
  getJustificacionesByTecho,
  getJustificacionesByArea,
  getJustificacionesByPartidaAndArea,
  createJustificacion,
  updateJustificacion,
  deleteJustificacion,
  upsertJustificacion,
} from "../../controllers/justificacionController/justificacion.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdJustificacion,
  validateTechoForJustificaciones,
  validateNewJustificacion,
  validateUpdateJustificacion,
  validateAreaForJustificaciones,
  validatePartidaAreaForJustificaciones,
  validateUpsertJustificacion,
} from "../../validations/justificacion.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Obtener todas las justificaciones
router.get("/", getAllJustificaciones);
router.get(
  "/id/:id_justificacion",
  validateIdJustificacion,
  getJustificacionById
);

// ✅ NUEVA: Ruta para obtener justificaciones por techo presupuestal
router.get(
  "/techo/:techo_id",
  validateTechoForJustificaciones,
  getJustificacionesByTecho
);

router.get(
  "/partida/:partida_id",
  getJustificacionesByPartida
);
router.get(
  "/area/:area_id",
  validateAreaForJustificaciones,
  getJustificacionesByArea
);

// ✅ MEJORADA: Ahora soporta query param techo_id
router.get(
  "/partida/:partida_id/area/:area_id",
  validatePartidaAreaForJustificaciones,
  getJustificacionesByPartidaAndArea
);

router.post("/", validateNewJustificacion, createJustificacion);
router.put(
  "/:id_justificacion",
  validateUpdateJustificacion,
  updateJustificacion
);
router.delete(
  "/:id_justificacion",
  validateIdJustificacion,
  deleteJustificacion
);

// ✅ MEJORADA: Usar validación específica para upsert
router.post("/upsert", validateUpsertJustificacion, upsertJustificacion);

export default router;
