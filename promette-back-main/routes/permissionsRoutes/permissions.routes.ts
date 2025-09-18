import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";
import {
  getAllPermisionsByUser,
  getPermissionsModule,
  getPermissionsPosition,
  getPermissionsUser,
  savePermissionsPosition,
  savePermissionsUser,
  removePermissionsUser,
  removePermissionsPosition,
} from "../../controllers/permissionsController/module.controller";

const router = Router();

router.get("/:areas", validateJwt, getPermissionsModule);

router.get(
  "/getPermissionsUser/:ct_usuario_id",
  validateJwt,
  getPermissionsUser
);

router.post("/permissionsUser", validateJwt, savePermissionsUser);

router.post("/removePermissionsUser", validateJwt, removePermissionsUser); // Nueva ruta para eliminar permisos 

router.get(
  "/getPermissionsPosition/:ct_puesto_id",
  validateJwt,
  getPermissionsPosition
);

router.get(
  "/getPermissionsByUser/:id_usuario",
  validateJwt,
  getAllPermisionsByUser
);

router.post("/permissionsPosition", validateJwt, savePermissionsPosition);

router.post("/removePermissionsPosition", validateJwt, removePermissionsPosition); // Nueva ruta para eliminar permisos 

export default router;
