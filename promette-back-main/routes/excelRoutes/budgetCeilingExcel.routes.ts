import { Router } from 'express';
import { generateBudgetCeilingExcel } from '../../controllers/excelController/budgetCeilingExcel.controller';
import { validateJwt } from '../../middlewares/validate.md';

const router = Router();

// Ruta para exportar techos presupuestales a Excel
router.get('/budget-ceilings', validateJwt, generateBudgetCeilingExcel);

export default router;
