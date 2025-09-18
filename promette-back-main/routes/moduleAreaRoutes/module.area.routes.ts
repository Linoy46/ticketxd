import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";

import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  deleteModuleArea,
  getAllModulesArea,
  getAllModulesByArea,
  registerModuleArea,
} from "../../controllers/moduleAreaController/module.area.controller";
import {
  validateIdModuleArea,
  validateNewModuleArea,
  validateUpdateModuleArea,
} from "../../validations/module.area.validations";

const router = Router();

router.get(
  "/", 
  //validateJwt,
  getAllModulesArea
);

router.get(
    "/:id_area", 
    //validateJwt,
    getAllModulesByArea
);

router.post(
  "/register",
  validateJwt,
  validateNewModuleArea,
  validateRequest,
  registerModuleArea
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteModuleArea
);

export default router;
