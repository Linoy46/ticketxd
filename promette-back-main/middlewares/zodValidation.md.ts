import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Crea un middleware para validar body con un esquema Zod
 * @param schema Esquema Zod para validar
 */
export const validateBody =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          msg: "Datos de entrada inválidos",
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
 * Crea un middleware para validar parámetros con un esquema Zod
 * @param schema Esquema Zod para validar
 */
export const validateParams =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          msg: "Parámetros inválidos",
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
 * Crea un middleware para validar query params con un esquema Zod
 * @param schema Esquema Zod para validar
 */
export const validateQuery =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          msg: "Parámetros de consulta inválidos",
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
 * Helper para formatear errores de Zod de manera consistente
 */
export const formatZodError = (error: ZodError) => {
  return {
    success: false,
    msg: "Error de validación",
    errors: error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    })),
  };
};
