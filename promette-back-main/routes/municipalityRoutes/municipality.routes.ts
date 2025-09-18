import { Router } from "express";
import {
  createMunicipality,
  deleteMunicipality,
  getAllMunicipalities,
  getMunicipalityById,
  updateMunicipality,
} from "../../controllers/municipalityController/municipality.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdMunicipio,
  validateNewMunicipality,
  validateUpdateMunicipality,
} from "../../validations/municipality.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los municipios
router.get("/", validateJwt, getAllMunicipalities);

// Ruta para obtener un municipio por ID
router.get(
  "/:id_municipio",
  validateJwt,
  validateIdMunicipio,
  validateRequest,
  getMunicipalityById
);

// Ruta para crear un nuevo municipio
router.post(
  "/",
  validateJwt,
  validateNewMunicipality,
  validateRequest,
  createMunicipality
);

// Ruta para actualizar un municipio
router.put(
  "/:id_municipio",
  validateJwt,
  validateUpdateMunicipality,
  validateRequest,
  updateMunicipality
);

// Ruta para eliminar un municipio
router.delete(
  "/:id_municipio",
  validateJwt,
  validateIdMunicipio,
  validateRequest,
  deleteMunicipality
);

export default router;
