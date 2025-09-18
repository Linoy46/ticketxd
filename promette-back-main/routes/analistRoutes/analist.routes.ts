import { Router } from "express";
import {
  deleteAnalyst,
  getAllAnalysts,
  getAnalystById,
  getAnalystsByAdministrativeUnit,
  registerAnalyst,
  updateAnalyst,
  getAreasByAnalyst,
} from "../../controllers/analistController/analist.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdAnalist,
  validateNewAnalist,
  validateUpdateAnalist,
} from "../../validations/analist.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los analistas
router.get("/", validateJwt, getAllAnalysts);

// Eliminar ruta getAnalystsByArea ya que no existe relación con ct_area

// Ruta para obtener analistas por unidad administrativa
router.get(
  "/administrativeUnit/:id_area_fin",
  validateJwt,
  getAnalystsByAdministrativeUnit
);

// Ruta para obtener un analista por ID - debe estar después de las rutas específicas
router.get(
  "/detail/:id_puesto_unidad",
  validateJwt,
  validateIdAnalist,
  validateRequest,
  getAnalystById
);

// Ruta para registrar un nuevo analista
router.post(
  "/register",
  validateJwt,
  validateNewAnalist,
  validateRequest,
  registerAnalyst
);

// Ruta para actualizar un analista
router.put(
  "/update",
  validateJwt,
  validateUpdateAnalist,
  validateRequest,
  updateAnalyst
);

// Ruta para eliminar un analista (cambio de estado)
router.put("/delete", validateJwt, deleteAnalyst);

// Ruta para obtener áreas por analista
router.get(
  "/areas/:ct_usuario_id",
  validateJwt,
  getAreasByAnalyst
);

export default router;
