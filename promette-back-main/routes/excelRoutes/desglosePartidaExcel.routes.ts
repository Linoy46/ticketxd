import { Router } from 'express';
import { validateJwt } from '../../middlewares/validate.md';
import { generaDesgloseExcel } from '../../controllers/excelController/desglosePartida.controller';

const router = Router();

// Ruta para exportar techos presupuestales a Excel
router.post('/desglose-partida', generaDesgloseExcel);

export default router;
