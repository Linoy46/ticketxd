import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllDirections,
  getDirectionById,
  registerDirection,
  updateDirection,
  deleteDirection,
} from "../../controllers/directionController/direction.controller";
import {
  validateIdDirection,
  validateNewDirection,
  validateUpdateDirection,
} from "../../validations/direction.validations";

const router = Router();

router.get("/", 
  validateJwt, 
  getAllDirections);

router.post(
  "/register",
  validateJwt,
  validateNewDirection,
  validateRequest,
  registerDirection
);

router.get(
  "/getById/:id_direccion", // Asegúrate de que el parámetro esté definido en la ruta
  validateJwt,
  validateIdDirection,
  validateRequest,
  getDirectionById
);

router.put(
  "/update", // 
  validateJwt,
  validateUpdateDirection,
  validateRequest,
  updateDirection
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteDirection,
);

export default router;
