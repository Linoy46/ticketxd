import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ConsumableDepartmentSchema } from "./consumableDelivery.validations";
import { validateBody, validateParams } from "../middlewares/zodValidation.md";

/**
 * Middleware para validar ID de departamento en parámetros
 */
export const validateIdDepartamento = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Esquema para validar el ID en params
    const idSchema = z.object({
      id_departamento: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
        message: "El id_departamento debe ser un número válido",
      }),
    });

    // Validar el parámetro
    idSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "ID de departamento inválido",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

/**
 * Middleware para validar nuevo departamento de consumible
 */
export const validateNewConsumableDepartment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validar el cuerpo usando el esquema ya definido
    ConsumableDepartmentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "Datos de departamento inválidos",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
export const validateUpdateConsumableDepartment = [
  validateIdDepartamento,
  validateNewConsumableDepartment,
];
