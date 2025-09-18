import { Router } from "express";
import {
  register,
  login,
  isLoggin,
  renewToken,
  forgotPassword,
  resetPassword,
  validateField,
  isAuthorization,
} from "../../controllers/authController/auth.controller";
import {
  validateRegister,
  validateLogin,
} from "../../validations/auth.validations";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { validateJwt } from "../../middlewares/validate.md";

const router = Router();

// Rutas limpias sin documentación inline
router.post("/register", validateRegister, validateRequest, register);
router.post("/login", validateLogin, validateRequest, login);
router.get("/isLoggin", isLoggin);
router.get("/isAuthorization/:token", isAuthorization);
router.get("/renew-token", renewToken);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", validateJwt, resetPassword);
router.post("/validateField", validateField);

export default router;
