import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  getAllSindicate,
  getSindicateByid,
  registerSindicate,
  updateSindicate,
} from "../../controllers/sindicateController/sindicate.controller";
import {
  validateIdSindicate,
  validateNewSindicate,
  validateUpdateSindicate,
} from "../../validations/sindicate.validations";

const router = Router();

router.get("/", getAllSindicate);

router.post(
  "/register",
  validateJwt,
  validateNewSindicate,
  validateRequest,
  registerSindicate
);

router.get(
  "/getById",
  validateJwt,
  validateIdSindicate,
  validateRequest,
  getSindicateByid
);

router.put(
  "/update",
  validateJwt,
  validateUpdateSindicate,
  validateRequest,
  updateSindicate
);
export default router;
