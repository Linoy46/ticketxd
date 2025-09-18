import { Router } from "express";
import {
  createFormato,
  getFormatoById,
  getAllFormatosEntrega,
  updateFormato,
  deleteFormato,
  associateEntregasToFormato,
} from "../../controllers/entregaFormatoController/entregaFormato.controller";
import { getHistorialFormatos } from "../../controllers/entregaFormatoController/historial.controller";
import { validateJwt } from "../../middlewares/validate.md";

const router = Router();

// IMPORTANTE: Las rutas específicas deben ir antes que las rutas con parámetros
// para evitar que Express las confunda

// Ruta para obtener el historial de formatos
router.get("/historial", validateJwt, getHistorialFormatos);

// Ruta para obtener todos los formatos
router.get("/", validateJwt, getAllFormatosEntrega);

// Resto de las rutas
router.post("/", validateJwt, createFormato);
router.post("/asociar-entregas", validateJwt, associateEntregasToFormato);

// Las rutas con parámetros deben ir al final
router.get("/:id_formato", validateJwt, getFormatoById);
router.put("/:id_formato", validateJwt, updateFormato);
router.delete("/:id_formato", validateJwt, deleteFormato);

export default router;
