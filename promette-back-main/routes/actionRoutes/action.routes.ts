import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllActions,
  getActionById,
  createAction,
  updateAction,
} from "../../controllers/actionController/action.controller";
import {
  validateIdAction,
  validateNewAction,
  validateUpdateAction,
} from "../../validations/action.validations";

const router = Router();

// Ruta para obtener todas las acciones
router.get("/", validateJwt, getAllActions);

// Ruta para registrar una nueva acción
router.post(
  "/register",
  validateJwt,
  validateNewAction,
  validateRequest,
  createAction
);

// Ruta para obtener una acción por ID
router.get(
  "/getById",
  validateJwt,
  validateIdAction,
  validateRequest,
  getActionById
);

// Ruta para actualizar una acción
router.post(
  "/update",
  validateJwt,
  validateUpdateAction,
  validateRequest,
  updateAction
);

export default router;
