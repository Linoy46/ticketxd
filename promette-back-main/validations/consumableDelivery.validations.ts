import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const ConsumableDeliverySchema = z.object({
  ct_area_id: z.number().int().positive(),
  dt_inventario_id: z.number().int().positive(),
  ct_unidad_id: z.number().int().positive(),
  cantidad: z.number().positive(),
  ct_usuario_id: z.number().int().positive(),
  folio: z.string().min(1).max(15).optional(), // Nuevo campo folio como opcional para permitir generación automática
  observaciones: z.string().max(500).optional(), // Campo observaciones opcional con máximo 500 caracteres
});

export type ConsumableDeliveryInput = z.infer<typeof ConsumableDeliverySchema>;
export const ConsumableDepartmentSchema = z.object({
  nombre_departamento: z.string().min(1).max(100),
  ct_puesto_id: z.number().int().positive().optional().nullable(),
  ct_direccion_id: z.number().int().positive(),
});

export type ConsumableDepartmentInput = z.infer<
  typeof ConsumableDepartmentSchema
>;

export const InventoryAdjustmentSchema = z.object({
  id_inventario: z.number().int().positive(),
  cantidad: z.number().positive(),
});

export type InventoryAdjustmentInput = z.infer<
  typeof InventoryAdjustmentSchema
>;
/**
 * Middleware para validar ID de entrega en parámetros
 */
export const validateIdEntrega = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Esquema para validar el ID en params
    const idSchema = z.object({
      id_entrega: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
        message: "El id_entrega debe ser un número válido",
      }),
    });

    // Validar el parámetro
    idSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "ID de entrega inválido",
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
 * Middleware para validar nueva entrega de consumible
 */
export const validateNewConsumableDelivery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validar el cuerpo usando el esquema ya definido
    ConsumableDeliverySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "Datos de entrega inválidos",
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
 * Middleware para validar actualización de entrega
 */
export const validateUpdateConsumableDelivery = [
  validateIdEntrega,
  validateNewConsumableDelivery,
];

/**
 * Middleware para validar ajuste de inventario
 */
export const validateInventoryAdjustment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validar el cuerpo usando el esquema de ajuste de inventario
    InventoryAdjustmentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        msg: "Datos de ajuste de inventario inválidos",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
