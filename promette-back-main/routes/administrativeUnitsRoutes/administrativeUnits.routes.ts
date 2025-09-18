import { Router } from "express";
import {
  eliminarUnidadAdministrativa,
  obtenerTodasLasUnidadesAdministrativas,
  obtenerUnidadAdministrativaPorId,
  registrarUnidadAdministrativa,
  actualizarUnidadAdministrativa,
} from "../../controllers/administrativeUnits/administrativeUnits.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdAdministrativeUnit,
  validateNewAdministrativeUnit,
  validateUpdateAdministrativeUnit,
} from "../../validations/administrativeUnits.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todas las unidades administrativas
router.get("/", validateJwt, obtenerTodasLasUnidadesAdministrativas);

// Ruta para obtener una unidad administrativa por ID
router.get(
  "/:id_area_fin",
  validateJwt,
  validateIdAdministrativeUnit,
  validateRequest,
  obtenerUnidadAdministrativaPorId
);

// Ruta para registrar una nueva unidad administrativa
router.post(
  "/register",
  validateJwt,
  validateNewAdministrativeUnit,
  validateRequest,
  registrarUnidadAdministrativa
);

// Ruta para actualizar una unidad administrativa
router.put(
  "/update",
  validateJwt,
  validateUpdateAdministrativeUnit,
  validateRequest,
  actualizarUnidadAdministrativa
);

// Ruta para eliminar una unidad administrativa (eliminación física)
router.delete(
  "/:id_area_fin",
  validateJwt,
  validateIdAdministrativeUnit,
  validateRequest,
  eliminarUnidadAdministrativa
);

export default router;
