import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const EntregaFormatoSchema = z.object({
  mes_cantidad: z.string().min(1).max(100).optional().nullable(),
  persona_recibe: z.string().min(1).max(255).optional().nullable(),
  ct_usuario_id: z.number().int().positive(),
  entregas_ids: z.array(z.number().int().positive()).optional(),
});

export type EntregaFormatoInput = z.infer<typeof EntregaFormatoSchema>;

/**
 * Middleware para validar ID de formato en parámetros
 */
export const validateIdFormato = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Esquema para validar el ID en params
    const idSchema = z.object({
      id_formato: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
        message: "El id_formato debe ser un número válido",
      }),
    });

    // Validar el parámetro
    idSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "ID de formato inválido",
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
 * Middleware para validar nuevo formato de entrega
 */
export const validateNewEntregaFormato = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validar el cuerpo usando el esquema ya definido
    EntregaFormatoSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "Datos de formato inválidos",
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
 * Middleware para validar actualización de formato
 */
export const validateUpdateEntregaFormato = [
  validateIdFormato,
  validateNewEntregaFormato,
];
