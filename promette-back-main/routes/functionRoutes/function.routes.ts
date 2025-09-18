import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { getAllFunctions, getModuleById, getFunctionById, registerFunction, updateFunction, deleteFuncion } from "../../controllers/functionController/function.controller";
import { validateIdFunction, validateNewFunction, validateUpdateFunction } from "../../validations/function.validations";

const router = Router();

router.get("/", validateJwt, getAllFunctions);
router.get("/:id_module", validateJwt, getModuleById,  validateRequest);

router.post(
  "/register",
  validateJwt,
  validateNewFunction,
  validateRequest,
  registerFunction
);

router.get(
  "/getById/:id_funcion",
  validateJwt,
  validateIdFunction,
  validateRequest,
  getFunctionById
);

router.put(
  "/update",
  validateJwt,
  validateUpdateFunction,
  validateRequest,
  updateFunction
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteFuncion
);

export default router;
