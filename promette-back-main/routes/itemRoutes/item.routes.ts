import { Router } from "express";
import {
  getAllItems,
  getItemById,
  getItemsByChapter,
  createItem,
  updateItem,
  deleteItem,
  getItemsWithProducts,
  getProductsByPartidaId,
  getItemsWithProductsRestricted,
} from "../../controllers/itemController/item.controller";
import { validateJwt } from "../../middlewares/validate.md";

const router = Router();

// Rutas específicas primero
router.get("/with-products", validateJwt, getItemsWithProducts);
router.get("/products/:id_partida", validateJwt, getProductsByPartidaId);
// 
router.get("/with-products-restricted/:id_area", validateJwt, getItemsWithProductsRestricted);
router.get("/products/:id_partida", validateJwt, getProductsByPartidaId);

// Rutas generales
router.get("/", validateJwt, getAllItems);
router.get("/:id_partida", validateJwt, getItemById);
router.get("/chapter/:id_capitulo", validateJwt, getItemsByChapter);
router.post("/", validateJwt, createItem);
router.put("/:id_partida", validateJwt, updateItem);
router.delete("/:id_partida", validateJwt, deleteItem);

export default router;
