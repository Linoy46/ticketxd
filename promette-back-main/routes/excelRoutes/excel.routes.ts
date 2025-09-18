import { Router } from 'express';
import * as excelController from '../../controllers/excelController/excel.controller';
import { check } from 'express-validator';
import { validateJwt } from '../../middlewares/validate.md';
import { validateRequest } from '../../middlewares/validateRequest.md';
import { generaDesgloseExcel } from '../../controllers/excelController/desglosePartida.controller';
import { generaJustificacionExcel } from '../../controllers/excelController/justificacionPartida.controller';
import { 
  generateExcelCorrespondencia,  // Ahora es la versión diaria
  generateExcelCorrespondenciaMensual 
} from '../../controllers/excelController/correspondenciaexcel.controller';
import { generateBudgetCeilingExcel } from '../../controllers/excelController/budgetCeilingExcel.controller';
import { generateCosteoArticuloExcel } from '../../controllers/excelController/costeoArticulo.controller';
import { generarCosteoGeneralExcel } from '../../controllers/excelController/costeoProducto.controller';
import { generarFormatoPresupuestalGeneralExcel } from '../../controllers/excelController/formatoPresupuestalGeneral.controller';
import desgloseConceptoRoutes from './desgloseConcepto.routes';

const router = Router();

// Ruta para generar un Excel para descarga directa
router.post('/generate', [
  validateJwt,
  check('data', 'Data is required and should be an array').isArray(),
  check('headers', 'Headers are required and should be an array').isArray(),
  check('sheetName', 'Sheet name is required').not().isEmpty(),
  check('fileName', 'File name is required').not().isEmpty(),
  validateRequest
], excelController.generateExcel);

// Ruta para generar y guardar un Excel en el servidor
router.post('/save', [
  validateJwt,
  check('data', 'Data is required and should be an array').isArray(),
  check('headers', 'Headers are required and should be an array').isArray(),
  check('sheetName', 'Sheet name is required').not().isEmpty(),
  validateRequest
], excelController.generateAndSaveExcel);

// Ruta para descargar un Excel previamente generado
router.get('/download/:fileName', validateJwt, excelController.downloadExcel);

router.post('/desglose-partida', generaDesgloseExcel);

router.post('/justificacion-partida', generaJustificacionExcel);


// Excel de correspondencias
router.get('/correspondencias/diarias', generateExcelCorrespondencia);
router.get('/correspondencias/mensuales', generateExcelCorrespondenciaMensual);

// Ruta para exportar techos presupuestales a Excel
router.get('/budget-ceilings', validateJwt, generateBudgetCeilingExcel);

// Ruta para exportar costeo por artículo a Excel
//no tomar este endpoint
router.post('/costeo-articulo', validateJwt, generateCosteoArticuloExcel);

//Ruta para exporar costeo por producto a Excel
router.post('/costeo-producto', validateJwt, generarCosteoGeneralExcel);

// Ruta para exportar formato presupuestal general a Excel
router.post('/formato-presupuestal-general', validateJwt, generarFormatoPresupuestalGeneralExcel);

router.use(desgloseConceptoRoutes);

export default router;
