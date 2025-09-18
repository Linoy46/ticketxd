import { Router } from "express";
import { configureMulterAneec, applicantFields } from "../../helpers/aneec.helper";
import { validateUploadPath } from "../../middlewares/multerErrorHandler";
import {
    accesoController,
    createApplicantAneec,
    getAllApplicantsAneec,
    getAllMunicipalities,
    getSpecificDocuments,
    testDiagnosticos,
    getAllApplicantsWithDiagnostics,
    changeApplicantState,
    getAllADiagnostics,
    getApplicantByUserId,
    getAuthorizedFacilitator,
    reprintApplicantReceipt,
    getSpecificReport,
    getAllReports,
    changeApplicantStateWithEmail,
    getSpecificPlanning,
    getAllPlannings
} from "../../controllers/aneecController/applicant.controller";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { validateJwt } from "../../middlewares/validate.md";
import { validateCreateApplicantAneec } from "../../validations/applicant.validations";
import { ValueType } from "exceljs";

const router = Router();

// Configuración de Multer
const subFolder = "documentsAneec";
const upload = configureMulterAneec(`${process.env.UPLOAD_BASE_PATH}/${subFolder}`);

// Configurar Multer para la creación y actualización de aspirantes
const multerCreateApplicantAneec = upload.fields(applicantFields());

// Middleware para validar la ruta de destino
router.use("/createApplicantAnec", validateUploadPath(subFolder));
router.use("/updateApplicantAnec", validateUploadPath(subFolder));


// Probar acceso al controlador
router.get("/pruebaConexion", accesoController);

//validar un json
router.post("/testDiagnosticos", testDiagnosticos);


  //METODOS PROTEGIDOS CON JWT

//Listar todos los aspirantes con sus diagnósticos
router.get("/getApplicantsWithDiagnosticsAneec",validateJwt, getAllApplicantsWithDiagnostics);

//Listas todos los diagnósticos
router.get("/getAllADiagnostics",validateJwt, getAllADiagnostics);

// Listar todos los aspirantes
router.get("/getApplicantsAneec",validateJwt, getAllApplicantsAneec);


//Actualizar el estado de un aspirante
router.put("/changeApplicantState",validateJwt, changeApplicantState);

//Obtener un aspirante en especifico por id de usuario en ct_usuario
router.get("/getApplicantByUserId/:id_usuario",validateJwt, getApplicantByUserId);

// Ruta para reimprimir el comprobante de registro de un facilitador
router.get("/reprintReceipt/:curp",validateJwt,reprintApplicantReceipt);



//Obtener una lista de los reportes
router.get('/getAllReports', getAllReports);

// Obtener todas las planeaciones asociadas a cada facilitador
router.get("/getAllPlannings", validateJwt, getAllPlannings);

// Actualizar el estado de un aspirante 
router.put('/changeApplicantStateWithEmail', validateJwt, changeApplicantStateWithEmail);






  //METODOS EXTERNOS SIN JWT  

// Obtener los municipios
router.get("/getMunicipalities", getAllMunicipalities);

// Método para obtener un documento específico de un aspirante
router.get("/getSpecificDocuments/:fileRoute",getSpecificDocuments);

//Obtener los datos de un facilitador autorizado o negar acceso 
router.get("/getAuthorizedFacilitator/:curp", getAuthorizedFacilitator);

// Obtener una planeación específica del facilitador
router.get("/getSpecificPlanning/:fileRoute", getSpecificPlanning);

// Obtener un informe específico del facilitador
router.get("/getSpecificInforme/:fileRoute", getSpecificReport);




// Crear nuevo aspirante con archivos
router.post(
  "/createApplicantAnec",
  multerCreateApplicantAneec,
  validateCreateApplicantAneec,
  validateRequest,
  createApplicantAneec,
);




export default router;