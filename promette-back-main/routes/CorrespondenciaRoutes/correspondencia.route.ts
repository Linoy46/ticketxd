import { Router } from "express";
import {
  insertarCorrespondencia,
  upload,
  obtenerFormasEntrega,
  obtenerCorrespondencia,
  editarObservacionesYEstado,
  obtenerClasificacionesPrioridad,
  obtenerEstadosCorrespondencia,
  enviarCURPsARUPEET,
  Documentscorrespondencia,
  generarPDFCorrespondencia,
  obtenerResumenCorrespondenciaPorArea,
  editarCorrespondencia,
} from "../../controllers/correspondenciaController/correspondencia.controller";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { validateJwt } from "../../middlewares/validate.md";

const router = Router();

// Ruta para registrar correspondencia
router.post(
  "/registroCorrespondencia",
  (req, res, next) => {
    console.log("Middleware de multer ejecutándose...");
    console.log("Archivo recibido:", req.file); // Debe ser `undefined` si hay un error
    if (!upload) {
      return res.status(400).json({ message: 'UPLOAD_BASE_PATH no definida' });
    }
    upload.single("ruta_correspondencia")(req, res, (err) => {
      if (err) {
        console.error("Error en multer:", err);
        return res.status(400).json({ message: "Error al subir el archivo" });
      }
      next();
    });
  },
  validateJwt,
  insertarCorrespondencia
);

// Ruta para obtener las formas de entrega
router.get("/formaEntrega", validateJwt, obtenerFormasEntrega);

// Ruta para obtener las clasificaciones de prioridad
router.get(
  "/clasificacionPrioridad",
  validateJwt,
  obtenerClasificacionesPrioridad
);

// Ruta para obtener la información de dt_correspondencia
router.post("/correspondencia", validateJwt, obtenerCorrespondencia);

// Ruta para editar observaciones (con validación JWT)
router.post(
  "/editarobservaciones",
  (req, res, next) => {
    if (!upload) {
      return res.status(400).json({ message: 'La variable de entorno UPLOAD_BASE_PATH no está definida.' });
    }
    upload.single("ruta_correspondencia")(req, res, next);
  },
  validateJwt,
  editarObservacionesYEstado
);

// Ruta para obtener los estados de correspondencia
router.get("/estadosCorrespondencia", validateJwt, obtenerEstadosCorrespondencia);

// Ruta para enviar CURPs a RUPEET
router.post("/areaPuestoNombre", validateJwt, enviarCURPsARUPEET);

// Método para obtener un documento específico de un aspirante
router.get(
  "/Documentscorrespondencia/:fileRoute",
  validateJwt,
  Documentscorrespondencia
);

// Ruta para generar PDF de correspondencia
router.get("/correspondencia/pdf/:id_correspondencia", validateJwt, generarPDFCorrespondencia);

// Ruta para obtener la cantidad de correspondencia asignada a cada área
router.get('/correspondenciaArea', validateJwt, obtenerResumenCorrespondenciaPorArea);

// Ruta para editar correspondencia
router.post(
  "/editarCorrespondencia",
  (req, res, next) => {
    if (!upload) {
      return res.status(400).json({ message: 'UPLOAD_BASE_PATH no definida' });
    }
    upload.single("ruta_correspondencia")(req, res, next);
  },
  validateJwt,
  editarCorrespondencia
);

export default router;

