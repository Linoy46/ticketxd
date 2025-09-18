import { Router } from "express";
import {
  createConsumableDelivery,
  deleteConsumableDelivery,
  getAllConsumableDeliveries,
  getConsumableDeliveryById,
  updateConsumableDelivery,
  uploadFormatoDocument,
  getFormatoDocument,
  checkFormatoDocument,
} from "../../controllers/consumableDeliveryController/consumableDelivery.controller";
import { validateJwt } from "../../middlewares/validate.md";
import { uploadFor } from "../../middlewares/upload.md";
import {
  validateIdEntrega,
  validateNewConsumableDelivery,
  validateUpdateConsumableDelivery,
} from "../../validations/consumableDelivery.validations";

const router = Router();

// Ruta para obtener todas las entregas
router.get("/", validateJwt, getAllConsumableDeliveries);

// Ruta para obtener una entrega por ID
router.get(
  "/:id_entrega",
  validateJwt,
  validateIdEntrega,
  getConsumableDeliveryById
);

// Ruta para crear una nueva entrega
router.post(
  "/",
  validateJwt,
  validateNewConsumableDelivery,
  createConsumableDelivery
);

// Ruta para actualizar una entrega
router.put(
  "/:id_entrega",
  validateJwt,
  validateUpdateConsumableDelivery,
  updateConsumableDelivery
);

// Ruta para eliminar una entrega
router.delete(
  "/:id_entrega",
  validateJwt,
  validateIdEntrega,
  deleteConsumableDelivery
);

// ===== NUEVAS RUTAS PARA GESTIÓN DE DOCUMENTOS =====

// Subir documento para un formato
router.post(
  "/formato/:folioFormato/documento",
  validateJwt,
  uploadFor("salidas", {
    documentType: "formatos",
    idField: "folioFormato",
  }),
  uploadFormatoDocument
);

// Obtener documento de un formato
router.get("/formato/:folioFormato/documento", validateJwt, getFormatoDocument);

// Verificar si un formato tiene documento
router.get(
  "/formato/:folioFormato/check-documento",
  validateJwt,
  checkFormatoDocument
);

export default router;
