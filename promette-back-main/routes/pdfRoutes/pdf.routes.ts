import { Router } from "express";
import { generateEntregaMaterialesPDF } from "../../controllers/pdfController/outsFormat.pdf.controller";
import { validateJwt } from "../../middlewares/validate.md"; // Import JWT validation middleware
import { generateRequisionCompraPDF } from "../../controllers/pdfController/financiamientosPdf.controller";
import { generarDictamenEscalafon } from "../../controllers/pdfController/dictamenEscalafon.controller";

const router = Router();

// Ruta para generar el PDF de entrega de materiales (protegida con JWT)
router.get(
  "/entrega-materiales/:folio_formato",
  validateJwt,
  generateEntregaMaterialesPDF
);

router.post(
  "/requisicion-compra",
  validateJwt,
  generateRequisionCompraPDF
);

router.post(
  "/dictamen-escalafon",
  // validateJwt,
  generarDictamenEscalafon
);

export default router;
