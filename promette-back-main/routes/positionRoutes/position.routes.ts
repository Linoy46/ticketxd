import {
  validateIdPosition,
  validateNewPosition,
  validateUpdatePosition,
} from "../../validations/position.validations";
import { Router } from "express";
import {
  deletePosition,
  getAllPositions,
  getPositionByDescription,
  getPositionById,
  registerPosition,
  updatePosition,
} from "../../controllers/positionController/position.controller";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

router.get("/", validateJwt, getAllPositions);

router.post(
  "/register",
  validateJwt,
  validateNewPosition,
  validateRequest,
  registerPosition
);

router.get(
  "/getPositionByDescription/:description",
  validateJwt,
  getPositionByDescription
);
router.get(
  "/getById/:id_puesto",
  validateJwt,
  validateIdPosition,
  validateRequest,
  getPositionById
);

router.put(
  "/update",
  validateJwt,
  validateUpdatePosition,
  validateRequest,
  updatePosition
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deletePosition
);

export default router;
