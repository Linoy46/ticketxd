import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  validateIdHistory,
  validateNewHistory,
} from "../../validations/history.validations";
import {
  getAllHistory,
  getHistoryByUserId,
  registerHistory,
} from "../../controllers/historyController/history.controller";

const router = Router();

router.get("/", validateJwt, getAllHistory);

router.post(
  "/register",
  //validateJwt,
  validateNewHistory,
  validateRequest,
  registerHistory
);

router.get(
  "/getById",
  validateJwt,
  validateIdHistory,
  validateRequest,
  getHistoryByUserId
);

export default router;
