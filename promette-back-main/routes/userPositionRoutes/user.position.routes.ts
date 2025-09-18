import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";

import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  deleteUserPosition,
  getAllPositionByUser,
  getUserPositionById,
  getUsersByPosition,
  obtenerUsuariosPorPuestosEspecificos,
  registerUserPosition,
  updateUserPosition,
  obtenerAreaFinancieroPorPuesto,
} from "../../controllers/userPositionController/user.position.controller";
import {
  validateIdUserPosition,
  validateNewUserPosition,
  validateUpdateUserPosition,
} from "../../validations/user.position.validations";

const router = Router();

router.get(
  "/bySpecificPositions",
  validateJwt,
  obtenerUsuariosPorPuestosEspecificos
);

router.get("/:id_usuario", getAllPositionByUser);
router.get(
  "/areaFinancieraPorPuesto/:id_puesto",
  obtenerAreaFinancieroPorPuesto
);

router.post(
  "/register",
  validateJwt,
  validateNewUserPosition,
  validateRequest,
  registerUserPosition
);

router.get(
  "/getById/:id_usuario_puesto",
  validateJwt,
  validateIdUserPosition,
  validateRequest,
  getUserPositionById
);

router.get("/byPosition/:ct_puesto_id", validateJwt, getUsersByPosition);

router.put(
  "/update",
  validateJwt,
  validateUpdateUserPosition,
  validateRequest,
  updateUserPosition
);

router.put("/delete", validateJwt, validateRequest, deleteUserPosition);
export default router;
