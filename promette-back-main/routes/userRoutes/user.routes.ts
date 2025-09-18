import { Router } from "express";
import {
  deleteUser,
  generateCurp,
  getAllUsers,
  getUserByCurp,
  getUserById,
  hashAndUpdatePasswords,
  registerUser,
  updatePassword,
  updateUser,
  updateUserOutside,
} from "../../controllers/usersController/users.controller";
import { validateJwt } from "../../middlewares/validate.md";
import {
  validateIdUser,
  validateNewUser,
  validateUpdateUser,
} from "../../validations/users.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";

const router = Router();

// Ruta para saber si esta autenticado
router.get("/:id_usuario", validateJwt, getAllUsers);

router.post(
  "/register",
  validateJwt,
  validateNewUser,
  validateRequest,
  registerUser
);

router.get(
  "/getById/:id_usuario",
  validateJwt,
  validateIdUser,
  validateRequest,
  getUserById
);

router.get("/getByCurp/:curp", getUserByCurp);

router.put(
  "/update",
  validateJwt,
  validateUpdateUser,
  validateRequest,
  updateUser
);

router.put("/updateUser", updateUserOutside);

//Ruta para generar curp para extranjeros
router.post("/generate-curp", validateJwt, generateCurp);

// Ruta para actualizar contraseña del usuario
router.post(
  "/updatePassword",
  validateJwt, // ← Comentado temporalmente para testing
  updatePassword
);

router.put("/delete", validateJwt, validateRequest, deleteUser);

export default router;
