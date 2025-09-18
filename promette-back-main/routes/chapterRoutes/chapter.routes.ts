import { Router } from "express";
import {
  createChapter,
  deleteChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
} from "../../controllers/chapterController/chapter.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdCapitulo,
  validateNewChapter,
  validateUpdateChapter,
} from "../../validations/chapter.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para obtener todos los capítulos
router.get("/", validateJwt, getAllChapters);

// Ruta para obtener un capítulo por ID
router.get(
  "/:id_capitulo",
  validateJwt,
  validateIdCapitulo,
  validateRequest,
  getChapterById
);

// Ruta para crear un nuevo capítulo
router.post(
  "/",
  validateJwt,
  validateNewChapter,
  validateRequest,
  createChapter
);

// Ruta para actualizar un capítulo existente
router.put(
  "/:id_capitulo",
  validateJwt,
  validateUpdateChapter,
  validateRequest,
  updateChapter
);

// Ruta para eliminar un capítulo lógicamente
router.delete(
  "/:id_capitulo",
  validateJwt,
  validateIdCapitulo,
  validateRequest,
  deleteChapter
);

export default router;