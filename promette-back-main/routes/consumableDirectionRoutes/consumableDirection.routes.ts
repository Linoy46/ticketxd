import { Router } from "express";
import {
  createConsumableDirection,
  deleteConsumableDirection,
  getAllConsumableDirections,
  getConsumableDirectionById,
  updateConsumableDirection,
} from "../../controllers/consumableDirection/consumableDirection.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdDireccion,
  validateNewConsumableDirection,
  validateUpdateConsumableDirection,
} from "../../validations/consumableDirection.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todas las direcciones de consumibles
router.get("/", validateJwt, getAllConsumableDirections);

// Ruta para obtener una dirección por ID
router.get(
  "/:id_direccion",
  validateJwt,
  validateIdDireccion,
  validateRequest,
  getConsumableDirectionById
);

// Ruta para crear una nueva dirección
router.post(
  "/",
  validateJwt,
  validateNewConsumableDirection,
  validateRequest,
  createConsumableDirection
);

// Ruta para actualizar una dirección
router.put(
  "/:id_direccion",
  validateJwt,
  validateUpdateConsumableDirection,
  validateRequest,
  updateConsumableDirection
);

// Ruta para eliminar una dirección
router.delete(
  "/:id_direccion",
  validateJwt,
  validateIdDireccion,
  validateRequest,
  deleteConsumableDirection
);

export default router;
