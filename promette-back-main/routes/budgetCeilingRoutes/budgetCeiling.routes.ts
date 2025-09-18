import { Router } from "express";
import {
  createBatchRequisitions,
  createBudgetCeiling,
  createBulkMonthlyRequisitions,
  createMonthlyRequisitions,
  deleteBudgetCeiling,
  getAllBudgetCeilings,
  getBudgetCeilingById,
  getTotalBudgetByArea,
  getTotalBudgetByAreaId,
  updateBudgetCeiling,
  getAllInfraAreas,
  getDiagnosticTotals,
  exportBudgetCeilingsToExcel,
} from "../../controllers/budgetCeilingController/budgetCeiling.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdArea,
  validateIdTecho,
  validateNewBudgetCeiling,
  validateUpdateBudgetCeiling,
  validateBatchRequisitions,
  validateMonthlyRequisitions,
  validateBulkMonthlyRequisitions,
} from "../../validations/budgetCeiling.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// obtener áreas de infraestructura
router.get("/areas", validateJwt, getAllInfraAreas);

// Ruta de diagnóstico temporal para techos
router.get("/diagnostic", validateJwt, getDiagnosticTotals);

// Ruta para obtener todos los totales por área
router.get("/totals/areas", validateJwt, getTotalBudgetByArea);

// Ruta para exportar techos presupuestales a Excel
router.get("/export/excel", validateJwt, exportBudgetCeilingsToExcel);

// Ruta para obtener todos los techos presupuestales
router.get("/", validateJwt, getAllBudgetCeilings);

// Ruta para obtener un techo presupuestal por ID (básico)
router.get(
  "/:id_techo",
  validateJwt,
  validateIdTecho,
  validateRequest,
  getBudgetCeilingById
);

// Ruta para obtener el total de presupuesto por área específica
router.get(
  "/totals/area/:id_area",
  validateJwt,
  validateIdArea,
  validateRequest,
  getTotalBudgetByAreaId
);

// Ruta para crear un nuevo techo presupuestal
router.post(
  "/",
  validateJwt,
  validateNewBudgetCeiling,
  validateRequest,
  createBudgetCeiling
);

// Ruta para actualizar un techo presupuestal
router.put(
  "/:id_techo",
  validateJwt,
  validateUpdateBudgetCeiling,
  validateRequest,
  updateBudgetCeiling
);

// Ruta para eliminar un techo presupuestal
router.delete(
  "/:id_techo",
  validateJwt,
  validateIdTecho,
  validateRequest,
  deleteBudgetCeiling
);
// Ruta para crear requisiciones por lote para un techo presupuestal
router.post(
  "/batch-requisitions",
  validateJwt,
  validateBatchRequisitions,
  validateRequest,
  createBatchRequisitions
);
// Ruta para crear requisiciones mensuales para un solo producto
router.post(
  "/monthly-requisitions",
  validateJwt,
  validateMonthlyRequisitions,
  validateRequest,
  createMonthlyRequisitions
);
// Ruta para crear requisiciones mensuales en bulk para múltiples productos
router.post(
  "/bulk-monthly-requisitions",
  validateJwt,
  validateBulkMonthlyRequisitions,
  validateRequest,
  createBulkMonthlyRequisitions
);

export default router;
