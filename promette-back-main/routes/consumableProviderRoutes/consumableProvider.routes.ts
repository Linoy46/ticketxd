import { Router } from "express";
import {
  createConsumableProvider,
  deleteConsumableProvider,
  getAllConsumableProviders,
  getConsumableProviderById,
  updateConsumableProvider,
} from "../../controllers/consumableProviderController/consumableProvider.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdProveedor,
  validateNewConsumableProvider,
  validateUpdateConsumableProvider,
} from "../../validations/consumableProvider.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los proveedores
router.get("/", validateJwt, getAllConsumableProviders);

// Ruta para obtener un proveedor por ID
router.get(
  "/:id_proveedor",
  validateJwt,
  validateIdProveedor,
  validateRequest,
  getConsumableProviderById
);

// Ruta para crear un nuevo proveedor
router.post(
  "/",
  validateJwt,
  validateNewConsumableProvider,
  validateRequest,
  createConsumableProvider
);

// Ruta para actualizar un proveedor
router.put(
  "/:id_proveedor",
  validateJwt,
  validateUpdateConsumableProvider,
  validateRequest,
  updateConsumableProvider
);

// Ruta para eliminar un proveedor
router.delete(
  "/:id_proveedor",
  validateJwt,
  validateIdProveedor,
  validateRequest,
  deleteConsumableProvider
);

export default router;
