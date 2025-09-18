import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { PartidaAreaController } from "../../controllers/partidaAreaController/partidaArea.controller";
import {
  validateAsignarPartida,
  validateRevocarPartida,
  validateAsignarMultiplesPartidas,
  validateIdAreaFin,
  validateIdPartida,
  validatePaginacion,
} from "../../validations/partidaArea.validations";

const router = Router();

// Obtener todas las relaciones partida-área con paginación
router.get(
  "/",
  validateJwt,
  validatePaginacion,
  validateRequest,
  PartidaAreaController.obtenerTodasLasRelaciones
);

// Obtener una relación partida-área por ID
router.get(
  "/:id_partida_area",
  validateJwt,
  validateRequest,
  PartidaAreaController.obtenerRelacionPorId
);

router.get(
  "/porArea/:id_area_fin",
  validateJwt,
  validateIdAreaFin,
  validateRequest,
  PartidaAreaController.obtenerPartidasPorArea
);

// Obtener áreas que tienen acceso a una partida específica
router.get(
  "/porPartida/:id_partida",
  validateJwt,
  validateIdPartida,
  validateRequest,
  PartidaAreaController.obtenerAreasPorPartida
);

router.get(
  "/verificarAcceso/:id_area_fin/:id_partida",
  validateJwt,
  validateRequest,
  PartidaAreaController.verificarAccesoPartida
);

router.get(
  "/disponibles/:id_area_fin",
  validateJwt,
  validateIdAreaFin,
  validateRequest,
  PartidaAreaController.obtenerPartidasDisponibles
);

// Crear una nueva relación partida-área
router.post(
  "/",
  validateJwt,
  validateAsignarPartida,
  validateRequest,
  PartidaAreaController.crearRelacion
);

// Asignar múltiples partidas a una unidad administrativa
router.post(
  "/asignarMultiples",
  validateJwt,
  validateAsignarMultiplesPartidas,
  validateRequest,
  PartidaAreaController.asignarMultiplesPartidas
);

// Actualizar una relación partida-área
router.put(
  "/:id_partida_area",
  validateJwt,
  validateRequest,
  PartidaAreaController.actualizarRelacion
);
router.delete(
  "/:id_partida_area",
  validateJwt,
  validateRevocarPartida,
  validateRequest,
  PartidaAreaController.cambiarEstadoRelacion
);

export default router;
