import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllDevices,
  getDeviceById,
  registerDevice,
  updateDevice,
} from "../../controllers/deviceController/device.controller";
import {
  validateIdDevice,
  validateNewDevice,
  validateUpdateDevice,
} from "../../validations/device.validations";

const router = Router();

router.get("/", validateJwt, getAllDevices);

router.post(
  "/register",
  validateJwt,
  validateNewDevice,
  validateRequest,
  registerDevice
);

router.get(
  "/getById/:id_dispositivo",
  validateJwt,
  validateIdDevice,
  validateRequest,
  getDeviceById
);

router.put(
  "/update/:id_dispositivo",
  validateJwt,
  validateUpdateDevice,
  validateRequest,
  updateDevice
);

export default router;
