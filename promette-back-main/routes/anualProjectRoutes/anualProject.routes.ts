import { Router } from "express";
import * as anualProjectController from "../../controllers/anualProjectController/anualproject.controller";
import { ensureAnualProjectExists } from "../../controllers/anualProjectController/anualproject.controller";
import { validateJwt } from "../../middlewares/validate.md";

const router = Router();

// Rutas específicas primero (antes de rutas con parámetros genéricos)
router.get("/year/:year", anualProjectController.getProjectsByYear);
router.get("/by-techo/:techo_id", anualProjectController.getProjectsByTechoId);

// Añadir la nueva ruta para asegurar que existe un proyecto anual
router.get("/ensure-exists/:dt_techo_id", validateJwt, ensureAnualProjectExists);

// Ruta de requisiciones por proyecto - DEBE IR ANTES que /:id_proyecto_anual
router.get("/:id_proyecto_anual/requisitions", anualProjectController.fetchRequisitionsByProjectId);
router.get("/:id_proyecto_anual/history", anualProjectController.getProjectHistory);

// Rutas genéricas para CRUD básico
router.get("/", anualProjectController.getAllProjects);
router.get("/:id_proyecto_anual", anualProjectController.getProjectById);
router.post("/", anualProjectController.registerProject);
router.put("/:id_proyecto_anual", anualProjectController.updateProject);

// Otras rutas específicas
router.post("/update-amount", anualProjectController.updateProjectAmount);
router.post("/historical-record", anualProjectController.createHistoricalRecord);

export default router;
