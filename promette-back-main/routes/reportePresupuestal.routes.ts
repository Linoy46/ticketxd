import { Router } from 'express';
import { validateJwt } from '../middlewares/validate.md';
import { generaReportePresupuestal } from '../controllers/reportePresupuestalController/reportePresupuestal.controller';

const router = Router();

// Ruta para exportar reporte presupuestal por financiamiento
router.post('/reporte-presupuestal', validateJwt, generaReportePresupuestal);

export default router; 