import { Router } from "express";
import {
  getAllFinanciamientos,
  getAllFinanciamientosNoFilter,
  getFinanciamientoById,
  createFinanciamiento,
  updateFinanciamiento,
  deleteFinanciamiento,
  getIdAreaFinByInfra
} from "../../controllers/budgetController/budget.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdFinanciamiento,
  validateNewFinanciamiento,
  validateUpdateFinanciamiento,
  validateDeleteFinanciamiento
} from "../../validations/budget.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los financiamientos (sin filtro de usuario)
router.get("/", validateJwt, getAllFinanciamientosNoFilter);

// Ruta para obtener todos los financiamientos por usuario
router.get("/user/:id_usuario", validateJwt, getAllFinanciamientos);

// Ruta para obtener un financiamiento por ID
router.get(
  "/item/:id_financiamiento",
  validateJwt,
  validateIdFinanciamiento,
  validateRequest,
  getFinanciamientoById
);

// Ruta para crear un nuevo financiamiento
router.post(
  "/",
  validateJwt,
  validateNewFinanciamiento,
  validateRequest,
  createFinanciamiento
);

// Ruta para actualizar un financiamiento
router.put(
  "/",
  validateJwt,
  validateUpdateFinanciamiento,
  validateRequest,
  updateFinanciamiento
);

// Ruta para eliminar un financiamiento
router.delete(
  "/",
  validateJwt,
  validateDeleteFinanciamiento,
  validateRequest,
  deleteFinanciamiento
);

// Endpoint para obtener id_area_fin a partir de id_area_infra
router.get(
  "/area-financiero/by-infra/:id_area_infra",
  validateJwt,
  getIdAreaFinByInfra
);

export default router;
