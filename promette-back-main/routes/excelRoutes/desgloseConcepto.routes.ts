import { Router } from 'express';
import desgloseConceptoController from '../../controllers/excelController/desgloseConcepto.controller';

const router = Router();

// POST /app/promette/api/excel/desgloseConcepto
router.post('/desgloseConcepto', desgloseConceptoController.generaDesgloseExcel);

export default router; 