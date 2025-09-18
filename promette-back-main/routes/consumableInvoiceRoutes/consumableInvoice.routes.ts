import { Router } from "express";
import {
  createConsumableInvoice,
  deleteConsumableInvoice,
  getAllConsumableInvoices,
  getConsumableInvoiceById,
  updateConsumableInvoice,
} from "../../controllers/consumableInvoiceController/consumableInvoice.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdFactura,
  validateNewConsumableInvoice,
  validateUpdateConsumableInvoice,
} from "../../validations/consumableInvoice.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todas las facturas de consumibles
router.get("/", validateJwt, getAllConsumableInvoices);

// Ruta para obtener una factura por ID
router.get(
  "/:id_factura",
  validateJwt,
  validateIdFactura,
  validateRequest,
  getConsumableInvoiceById
);

// Ruta para crear una nueva factura
router.post(
  "/",
  validateJwt,
  validateNewConsumableInvoice,
  validateRequest,
  createConsumableInvoice
);

// Ruta para actualizar una factura
router.put(
  "/:id_factura",
  validateJwt,
  validateUpdateConsumableInvoice,
  validateRequest,
  updateConsumableInvoice
);

// Ruta para eliminar una factura
router.delete(
  "/:id_factura",
  validateJwt,
  validateIdFactura,
  validateRequest,
  deleteConsumableInvoice
);

export default router;
