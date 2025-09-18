import { Router } from "express";
import {
  createConsumableDepartment,
  deleteConsumableDepartment,
  getAllConsumableDepartments,
  getConsumableDepartmentById,
  updateConsumableDepartment,
} from "../../controllers/consumableDepartmentController/consumableDepartment.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdDepartamento,
  validateNewConsumableDepartment,
  validateUpdateConsumableDepartment,
} from "../../validations/consumableDepartment.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los departamentos de consumibles
router.get("/", validateJwt, getAllConsumableDepartments);

// Ruta para obtener un departamento por ID
router.get(
  "/:id_departamento",
  validateJwt,
  validateIdDepartamento,
  validateRequest,
  getConsumableDepartmentById
);

// Ruta para crear un nuevo departamento
router.post(
  "/",
  validateJwt,
  validateNewConsumableDepartment,
  validateRequest,
  createConsumableDepartment
);

// Ruta para actualizar un departamento
router.put(
  "/:id_departamento",
  validateJwt,
  validateUpdateConsumableDepartment,
  validateRequest,
  updateConsumableDepartment
);

// Ruta para eliminar un departamento
router.delete(
  "/:id_departamento",
  validateJwt,
  validateIdDepartamento,
  validateRequest,
  deleteConsumableDepartment
);

export default router;
