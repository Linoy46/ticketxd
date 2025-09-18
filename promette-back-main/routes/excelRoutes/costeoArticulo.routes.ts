import { Router } from 'express';
import { validateJwt } from '../../middlewares/validate.md';
import { generateCosteoArticuloExcel } from '../../controllers/excelController/costeoArticulo.controller';

const router = Router();

// Ruta para exportar costeo por artículo a Excel
router.post('/costeo-articulo', [
  validateJwt
], generateCosteoArticuloExcel);

export default router; 