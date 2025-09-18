import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  deleteModule,
  getAllModules,
  getAllPrimaryModules,
  getModuleById,
  registerModule,
  updateModule,
} from "../../controllers/moduleController/module.controller";
import {
  validateIdModule,
  validateNewModule,
  validateUpdateModule,
} from "../../validations/module.validations";

const router = Router();

router.get("/", validateJwt, getAllModules);

router.get("/primary", validateJwt, getAllPrimaryModules);

router.post(
  "/register",
  validateJwt,
  validateNewModule,
  validateRequest,
  registerModule
);

router.get(
  "/getById/:id_modulo",
  validateJwt,
  validateIdModule,
  validateRequest,
  getModuleById
);

router.put(
  "/update",
  validateJwt,
  validateUpdateModule,
  validateRequest,
  updateModule
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteModule
);

export default router;
