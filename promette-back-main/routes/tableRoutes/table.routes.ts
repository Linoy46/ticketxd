import { Router } from "express";

import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  validateIdTable,
  validateNewTable,
  validateUpdateTable,
} from "../../validations/table.validations";
import {
  getAllTables,
  getTableByid,
  registerTable,
  updateTable,
} from "../../controllers/tableController/table.controller";

const router = Router();

router.get("/", validateJwt, getAllTables);

router.post(
  "/register",
  validateJwt,
  validateNewTable,
  validateRequest,
  registerTable
);

router.get(
  "/getById",
  validateJwt,
  validateIdTable,
  validateRequest,
  getTableByid
);

router.put(
  "/update",
  validateJwt,
  validateUpdateTable,
  validateRequest,
  updateTable
);
export default router;
