import { Router } from "express";
import {
  createConsumableProduct,
  deleteConsumableProduct,
  getAllConsumableProducts,
  getConsumableProductById,
  getProductsByItem,
  getProductsByItemId,
  getProductsRestrictedByItemId,
  updateConsumableProduct,
} from "../../controllers/consumableProductController/consumableProduct.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdProducto,
  validateNewConsumableProduct,
  validateUpdateConsumableProduct,
} from "../../validations/consumableProduct.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los productos
router.get("/", validateJwt, getAllConsumableProducts);

// IMPORTANTE: Asegúrate que esta ruta esté registrada ANTES de la ruta para el ID
// Ruta para obtener productos por ID de partida (usa getProductsByItemId)
router.get("/item/:id_partida", validateJwt, getProductsByItemId);
router.get("/itemRestricted/:id_area/:id_partida", validateJwt, getProductsRestrictedByItemId);

// Get products by partida ID (item)
router.get("/item/:itemId", validateJwt, getProductsByItemId);

// Ruta para obtener un producto por ID
router.get(
  "/:id_producto",
  validateJwt,
  validateIdProducto,
  validateRequest,
  getConsumableProductById
);

// Ruta para crear un nuevo producto
router.post(
  "/",
  validateJwt,
  validateNewConsumableProduct,
  validateRequest,
  createConsumableProduct
);

// Ruta para actualizar un producto
router.put(
  "/:id_producto",
  validateJwt,
  validateUpdateConsumableProduct,
  validateRequest,
  updateConsumableProduct
);

// Ruta para eliminar un producto ( cambia de estado de 1 a 0)
router.post(
  "/:id_producto",
  validateJwt,
  validateIdProducto,
  validateRequest,
  deleteConsumableProduct
);

export default router;
