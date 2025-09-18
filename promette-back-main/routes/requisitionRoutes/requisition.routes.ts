import { Router } from "express";
import {
  createRequisition,
  deleteRequisition,
  getRequisitionById,
  updateRequisition,
  createUnifiedRequisition,
  updateProyectoAnualMonto,
  getRequisitions,
} from "../../controllers/requisitionController/requisition.controller";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  validateNewRequisition,
  validateUpdateRequisition,
} from "../../validations/requisition.validations";

const router = Router();

// Rutas estándar CRUD para consulta
router.get("/", validateJwt, getRequisitions);
router.get("/:id_producto_requisicion", validateJwt, getRequisitionById);

// Requisiciones individuales
router.post(
  "/",
  validateJwt,
  validateNewRequisition,
  validateRequest,
  createRequisition
);
router.put(
  "/:id_producto_requisicion",
  validateJwt,
  validateUpdateRequisition,
  validateRequest,
  updateRequisition
);
router.delete("/:id_producto_requisicion", validateJwt, deleteRequisition);

// Endpoint principal para crear requisiciones (individual o múltiple)
// Asegúrate que la ruta sea exactamente "/create" y NO "/create%20" ni tenga espacios
router.post("/create", validateJwt, createUnifiedRequisition);

// Nuevo endpoint para actualizar/recalcular montos de proyecto anual
router.post(
  "/recalcular-proyecto/:dt_techo_id",
  validateJwt,
  updateProyectoAnualMonto
);

export default router;
