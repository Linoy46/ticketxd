import { Router } from "express";
import {
  createMeasurementUnit,
  deleteMeasurementUnit,
  getAllMeasurementUnits,
  getMeasurementUnitById,
  updateMeasurementUnit,
} from "../../controllers/measurementUnitController/measurementUnit.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdUnidad,
  validateNewMeasurementUnit,
  validateUpdateMeasurementUnit,
} from "../../validations/measurementUnit.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todas las unidades de medida
router.get("/", validateJwt, getAllMeasurementUnits);

// Ruta para obtener una unidad de medida por ID
router.get(
  "/:id_unidad",
  validateJwt,
  validateIdUnidad,
  validateRequest,
  getMeasurementUnitById
);

// Ruta para crear una nueva unidad de medida
router.post(
  "/",
  validateJwt,
  validateNewMeasurementUnit,
  validateRequest,
  createMeasurementUnit
);

// Ruta para actualizar una unidad de medida
router.put(
  "/:id_unidad",
  validateJwt,
  validateUpdateMeasurementUnit,
  validateRequest,
  updateMeasurementUnit
);

// Ruta para eliminar una unidad de medida
router.delete(
  "/:id_unidad",
  validateJwt,
  validateIdUnidad,
  validateRequest,
  deleteMeasurementUnit
);

export default router;
