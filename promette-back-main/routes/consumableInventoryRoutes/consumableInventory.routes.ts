import { Router } from "express";
import {
  createConsumableInventory,
  createBatchConsumableInventory,
  deleteConsumableInventory,
  getAllConsumableInventories,
  getConsumableInventoryById,
  updateConsumableInventory,
} from "../../controllers/consumableInventoryController/consumableInventory.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdInventario,
  validateNewConsumableInventory,
  validateUpdateConsumableInventory,
} from "../../validations/consumableInventory.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los inventarios
router.get("/", validateJwt, getAllConsumableInventories);

// Ruta para obtener un inventario por ID
router.get(
  "/:id_inventario",
  validateJwt,
  validateIdInventario,
  validateRequest,
  getConsumableInventoryById
);

// Ruta para crear un nuevo inventario
router.post(
  "/",
  validateJwt,
  validateNewConsumableInventory,
  validateRequest,
  createConsumableInventory
);

// Nueva ruta para crear múltiples inventarios en lote
router.post(
  "/batch",
  validateJwt,
  validateRequest,
  createBatchConsumableInventory
);

// Ruta para actualizar un inventario
router.put(
  "/:id_inventario",
  validateJwt,
  validateUpdateConsumableInventory,
  validateRequest,
  updateConsumableInventory
);

// Ruta para eliminar un inventario
router.delete(
  "/:id_inventario",
  validateJwt,
  validateIdInventario,
  validateRequest,
  deleteConsumableInventory
);

export default router;
