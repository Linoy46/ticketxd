import { Router } from "express";
import {
    accesoController,
    //registrarDiagnostico,
    uploadDiagnostico,
    //obtenerDiagnosticos,
    registrarInforme,
    uploadInformeMiddleware,
    obtenerInformesPorAspiranteId,
    getPlanningCatalog,
    guardarPlaneacion,
    uploadPlaneacionMiddleware,
    obtenerPlaneacionesPorAspiranteId,

} from "../../controllers/aneecController/evaluator.controller";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { validateJwt } from "../../middlewares/validate.md";
import { validateUploadPath } from "../../middlewares/multerErrorHandler";
import { handleMulterError } from "../../middlewares/multerErrorHandler";

const router = Router();

router.get("/pruebaConexion", accesoController)

//router.post("/registrarDiagnostico", uploadDiagnostico, registrarDiagnostico)

//router.get("/diagnosticos", obtenerDiagnosticos)






//METODOS CON JWT


//Metodos sin JWT

// Ruta para obtener el catálogo de documentos ANEEC
router.get("/getPlanningCatalog", getPlanningCatalog);

//Metodo para guardar informe
router.post('/saveInforme',
  validateUploadPath('InformesAneec'),
  uploadInformeMiddleware,
  handleMulterError,
  registrarInforme
);


//Metodo para guardar planeacion
router.post(
  "/guardarPlaneacion", 
  validateUploadPath('PlaneacionesAneec'), 
  uploadPlaneacionMiddleware, 
  // Manejo de errores de Multer
  handleMulterError, 
  guardarPlaneacion
);



//Metodo para obtener los reportes por aspirante
router.get('/informes/:dt_aspirante_id', obtenerInformesPorAspiranteId);

//Metodo para obtener las planeaciones por aspirante
router.get('/planeaciones/:dt_aspirante_id', obtenerPlaneacionesPorAspiranteId);


export default router;