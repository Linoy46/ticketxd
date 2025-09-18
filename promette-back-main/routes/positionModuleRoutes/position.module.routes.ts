import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";

import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllPositionModule,
  getPositionModuleById,
  registerPositionModule,
  updatePositionModule,
} from "../../controllers/positionModuleController/position.module.controller";
import {
  validateIdPositionModule,
  validateNewPositionModule,
  validateUpdatePositionModule,
} from "../../validations/position.module.validations";

const router = Router();

router.get("/", getAllPositionModule);

router.post(
  "/register",
  validateJwt,
  validateNewPositionModule,
  validateRequest,
  registerPositionModule
);

router.get(
  "/getById",
  validateJwt,
  validateIdPositionModule,
  validateRequest,
  getPositionModuleById
);

router.put(
  "/update",
  validateJwt,
  validateUpdatePositionModule,
  validateRequest,
  updatePositionModule
);

export default router;
