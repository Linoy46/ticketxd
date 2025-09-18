import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllDepartments,
  getDepartmentById,
  registerDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../controllers/departmentController/department.controller";
import {
  validateIdDepartment,
  validateNewDepartment,
  validateUpdateDepartment,
} from "../../validations/department.validations";

const router = Router();

router.get("/", 
  validateJwt, 
  getAllDepartments);

router.post(
  "/register",
  validateJwt,
  validateNewDepartment,
  validateRequest,
  registerDepartment
);

router.get(
  "/getById/:id_departamento",
  validateJwt,
  validateIdDepartment,
  validateRequest,
  getDepartmentById
);

router.put(
  "/update",
  validateJwt,
  validateUpdateDepartment,
  validateRequest,
  updateDepartment
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteDepartment,
);

export default router;
