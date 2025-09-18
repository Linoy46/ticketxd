import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";

import {
  getAllCertificates,
  getCertificatesDesign,
  saveCertificatesDesign,
} from "../../controllers/certificatesController/certificates.controller";

const router = Router();

// Ruta para obtener todas las acciones
router.get("/:area", validateJwt, getAllCertificates);
router.get(
  "/getDesign/:id_constanciaCurso",
  validateJwt,
  getCertificatesDesign
);

router.post("/register", validateJwt, saveCertificatesDesign);
export default router;
