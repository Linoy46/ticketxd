import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import {
  toDecimal,
  DecimalOps,
  decimalToNumber,
} from "../../utils/decimal.utils";
import { ConsumableDeliverySchema } from "../../validations/consumableDelivery.validations";
import { ZodError } from "zod"; // Importa el tipo ZodError
import { Op } from "sequelize";
import { handleUpload } from "../../helpers/upload.helper";
import path from "path";
import fs from "fs";



/**
 * Sistema para generar folios únicos para entregas
 */
const generateDeliveryFolio = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const prefix = `ENTR-${year}-`;

  // Buscar el último folio con el prefijo actual
  const lastDelivery = await promette.dt_consumible_entrega.findOne({
    where: {
      folio: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["folio", "DESC"]],
  });

  let counter = 1;

  if (lastDelivery) {
    // Extraer el número del último folio
    const lastNumber = parseInt(lastDelivery.folio.replace(prefix, ""), 10);
    if (!isNaN(lastNumber)) {
      counter = lastNumber + 1;
    }
  }

  // Crear el nuevo folio
  return `${prefix}${counter.toString().padStart(4, "0")}`;
};

// Controlador para obtener todas las entregas
export const getAllConsumableDeliveries = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const deliveries = await promette.dt_consumible_entrega.findAll({
      include: [
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
        },
        // ct_area se consulta desde API externa
        {
          model: promette.dt_consumible_inventario,
          as: "dt_inventario",
          include: [
            { model: promette.ct_consumible_factura, as: "ct_factura" },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "usuario_entrega",
        },
        {
          model: promette.rl_entrega_formato,
          as: "formato",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (deliveries.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron entregas registradas",
      });
    }

    return res.status(200).json({
      deliveries,
    });
  } catch (error) {
    console.error("Error en getAllConsumableDeliveries:", error);
    return res.status(500).json({
      msg: "Error al obtener las entregas",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para obtener una entrega por ID
export const getConsumableDeliveryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_entrega } = req.params;

  try {
    // Consulta completa con todas las relaciones necesarias
    const delivery = await promette.dt_consumible_entrega.findByPk(id_entrega, {
      include: [
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
        },
        // ct_area se consulta desde API externa
        {
          model: promette.dt_consumible_inventario,
          as: "dt_inventario",
          include: [
            { model: promette.ct_consumible_factura, as: "ct_factura" },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "usuario_entrega",
        },
        {
          model: promette.rl_entrega_formato,
          as: "formato",
        },
      ],
    });

    if (!delivery) {
      return res.status(404).json({
        msg: "Entrega no encontrada",
      });
    }

    return res.status(200).json({
      delivery,
    });
  } catch (error) {
    console.error("Error en getConsumableDeliveryById:", error);
    return res.status(500).json({
      msg: "Error al obtener la entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para crear una nueva entrega
export const createConsumableDelivery = async (req: Request, res: Response) => {
  try {
    // Validar entrada usando Zod
    const validatedData = ConsumableDeliverySchema.parse(req.body);
    const {
      ct_area_id,
      dt_inventario_id,
      ct_unidad_id,
      cantidad,
      ct_usuario_id,
      folio: customFolio,
      observaciones,
    } = validatedData;

    // Verificar si el inventario existe
    const inventory = await promette.dt_consumible_inventario.findByPk(
      dt_inventario_id
    );

    if (!inventory) {
      return res.status(400).json({
        msg: "El inventario especificado no existe",
      });
    }

    // Usar Decimal.js para comparaciones y cálculos precisos
    const inventoryResta = toDecimal(inventory.resta);
    const deliveryQuantity = toDecimal(cantidad);

    // Verificar si hay suficiente cantidad en inventario
    if (DecimalOps.isLessThan(inventoryResta, deliveryQuantity)) {
      return res.status(400).json({
        msg: "No hay suficiente existencia en el inventario",
        disponible: decimalToNumber(inventoryResta),
        solicitado: decimalToNumber(deliveryQuantity),
      });
    }

    // Nota: ct_area_id se valida desde API externa en el frontend
    // No necesitamos verificar existencia aquí

    // Verificar si la unidad existe
    const unit = await promette.ct_unidad_medida.findByPk(ct_unidad_id);

    if (!unit) {
      return res.status(400).json({
        msg: "La unidad especificada no existe",
      });
    }

    // Verificar si el usuario existe
    const user = await promette.ct_usuario.findByPk(ct_usuario_id);

    if (!user) {
      return res.status(400).json({
        msg: "El usuario especificado no existe",
      });
    }

    // Generar un folio para la entrega o usar el personalizado si se proporciona
    const folio = customFolio || (await generateDeliveryFolio());

    // Verificar que el folio sea único
    const existingDelivery = await promette.dt_consumible_entrega.findOne({
      where: { folio },
    });

    if (existingDelivery) {
      return res.status(400).json({
        msg: "Ya existe una entrega con ese folio",
      });
    }

    // Crear una nueva entrega
    const newDelivery = await promette.dt_consumible_entrega.create({
      folio,
      ct_area_id,
      dt_inventario_id,
      ct_unidad_id,
      cantidad: decimalToNumber(deliveryQuantity),
      ct_usuario_id,
      observaciones,
    });

    // Calcular nueva cantidad restante con precisión decimal
    const newResta = DecimalOps.subtract(inventoryResta, deliveryQuantity);

    // Actualizar la cantidad restante en el inventario
    await promette.dt_consumible_inventario.update(
      {
        resta: decimalToNumber(newResta),
      },
      {
        where: { id_inventario: dt_inventario_id },
      }
    );

    // Para evitar errores con asociaciones, usamos un enfoque diferente para retornar la entrega
    const deliveryCreated = await promette.dt_consumible_entrega.findByPk(
      newDelivery.id_entrega,
      {
        include: [
          {
            model: promette.ct_unidad_medida,
            as: "ct_unidad",
          },
          {
            model: promette.dt_consumible_inventario,
            as: "dt_inventario",
            include: [
              { model: promette.ct_consumible_factura, 
                as: "ct_factura" },
            ],
          },
          {
            model: promette.ct_usuario,
            as: "ct_usuario",
          },
        ],
      }
    );

    return res.status(201).json({
      msg: "Entrega registrada correctamente",
      delivery: deliveryCreated,
    });
  } catch (error: unknown) {
    console.error("Error en createConsumableDelivery:", error);
    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      return res.status(400).json({
        msg: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      msg: "Error al crear la entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para actualizar una entrega
export const updateConsumableDelivery = async (req: Request, res: Response) => {
  const { id_entrega } = req.params;

  try {
    // Validar entrada usando Zod
    const validatedData = ConsumableDeliverySchema.parse(req.body);
    const {
      ct_area_id,
      dt_inventario_id,
      ct_unidad_id,
      cantidad,
      ct_usuario_id,
      folio,
      observaciones,
    } = validatedData;

    // Verificar si la entrega existe
    const delivery = await promette.dt_consumible_entrega.findByPk(id_entrega);

    if (!delivery) {
      return res.status(404).json({
        msg: "Entrega no encontrada",
      });
    }

    // Verificar si el folio ya existe (excepto para la entrega actual)
    if (folio !== delivery.folio) {
      const existingDelivery = await promette.dt_consumible_entrega.findOne({
        where: {
          folio,
          id_entrega: { [Op.ne]: id_entrega },
        },
      });

      if (existingDelivery) {
        return res.status(400).json({
          msg: "Ya existe otra entrega con ese folio",
        });
      }
    }

    // Si el inventario es el mismo que tenía la entrega
    if (dt_inventario_id === delivery.dt_inventario_id) {
      // Obtener el inventario actual
      const inventory = await promette.dt_consumible_inventario.findByPk(
        dt_inventario_id
      );

      if (!inventory) {
        return res.status(400).json({
          msg: "El inventario especificado no existe",
        });
      }

      // Usar Decimal.js para cálculos precisos
      const prevQuantity = toDecimal(delivery.cantidad);
      const newQuantity = toDecimal(cantidad);
      const currentResta = toDecimal(inventory.resta);

      // Calcular el ajuste necesario al inventario
      const adjustedResta = DecimalOps.add(
        currentResta,
        DecimalOps.subtract(prevQuantity, newQuantity)
      );

      if (DecimalOps.isLessThan(adjustedResta, 0)) {
        return res.status(400).json({
          msg: "No hay suficiente existencia en el inventario para realizar este ajuste",
          disponible: decimalToNumber(
            DecimalOps.add(currentResta, prevQuantity)
          ),
          solicitado: decimalToNumber(newQuantity),
        });
      }

      // Actualizar la entrega
      await promette.dt_consumible_entrega.update(
        {
          folio,
          ct_area_id,
          dt_inventario_id,
          ct_unidad_id,
          cantidad: decimalToNumber(newQuantity),
          ct_usuario_id,
          observaciones,
        },
        {
          where: { id_entrega },
        }
      );

      // Actualizar el inventario
      await promette.dt_consumible_inventario.update(
        {
          resta: decimalToNumber(adjustedResta),
        },
        {
          where: { id_inventario: dt_inventario_id },
        }
      );
    } else {
      // Si el inventario es distinto, actualizar ambos inventarios
      // Recuperar la cantidad original en el inventario anterior
      const oldInventory = await promette.dt_consumible_inventario.findByPk(
        delivery.dt_inventario_id
      );
      if (oldInventory) {
        await promette.dt_consumible_inventario.update(
          {
            resta: Number(oldInventory.resta) + Number(delivery.cantidad),
          },
          {
            where: { id_inventario: delivery.dt_inventario_id },
          }
        );
      }

      // Verificar si hay suficiente cantidad en el nuevo inventario
      const newInventory = await promette.dt_consumible_inventario.findByPk(
        dt_inventario_id
      );
      if (!newInventory) {
        return res.status(400).json({
          msg: "El nuevo inventario especificado no existe",
        });
      }

      if (Number(newInventory.resta) < Number(cantidad)) {
        return res.status(400).json({
          msg: "No hay suficiente existencia en el nuevo inventario",
        });
      }

      // Actualizar la entrega
      await promette.dt_consumible_entrega.update(
        {
          folio,
          ct_area_id,
          dt_inventario_id,
          ct_unidad_id,
          cantidad,
          ct_usuario_id,
          observaciones,
        },
        {
          where: { id_entrega },
        }
      );

      // Actualizar el nuevo inventario
      await promette.dt_consumible_inventario.update(
        {
          resta: Number(newInventory.resta) - Number(cantidad),
        },
        {
          where: { id_inventario: dt_inventario_id },
        }
      );
    }

    // Obtener la entrega actualizada con relaciones
    const updatedDelivery = await promette.dt_consumible_entrega.findByPk(
      id_entrega,
      {
        include: [
          { model: promette.ct_unidad_medida, as: "ct_unidad" },
          // ct_area se consulta desde API externa
          {
            model: promette.dt_consumible_inventario,
            as: "dt_inventario",
            include: [
              { model: promette.ct_consumible_factura, as: "ct_factura" },
            ],
          },
          { model: promette.ct_usuario, as: "usuario_entrega" },
        ],
      }
    );

    return res.status(200).json({
      msg: "Entrega actualizada correctamente",
      delivery: updatedDelivery,
    });
  } catch (error: unknown) {
    console.error("Error en updateConsumableDelivery:", error);
    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      return res.status(400).json({
        msg: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      msg: "Error al actualizar la entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para eliminar una entrega
export const deleteConsumableDelivery = async (req: Request, res: Response) => {
  const { id_entrega } = req.params;

  try {
    // Verificar si la entrega existe
    const delivery = await promette.dt_consumible_entrega.findByPk(id_entrega);

    if (!delivery) {
      return res.status(404).json({
        msg: "Entrega no encontrada",
      });
    }

    // Obtener el inventario relacionado y devolver la cantidad entregada
    const inventory = await promette.dt_consumible_inventario.findByPk(
      delivery.dt_inventario_id
    );

    if (inventory) {
      await promette.dt_consumible_inventario.update(
        {
          resta: Number(inventory.resta) + Number(delivery.cantidad),
        },
        {
          where: { id_inventario: delivery.dt_inventario_id },
        }
      );
    }

    // Eliminar la entrega
    await promette.dt_consumible_entrega.destroy({
      where: { id_entrega },
    });

    return res.status(200).json({
      msg: "Entrega eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deleteConsumableDelivery:", error);
    return res.status(500).json({
      msg: "Error al eliminar la entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Controlador para verificar si un formato tiene un documento asociado
 */
export const checkFormatoDocument = async (req: Request, res: Response) => {
  try {
    const { folioFormato } = req.params;

    // Verificar que el formato existe en la base de datos
    const formato = await promette.rl_entrega_formato.findOne({
      where: { folio_formato: folioFormato },
      attributes: ["folio_formato"],
    });

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: "Formato de entrega no encontrado",
      });
    }

    // Construir la ruta donde debería estar el documento
    const uploadsPath =
      process.env.UPLOADS_PATH || path.join(__dirname, "..", "..", "uploads");
    const documentPath = path.join(
      uploadsPath,
      "salidas",
      "formatos",
      `${folioFormato}.pdf`
    );

    // Verificar si existe el archivo físicamente
    const hasDocument = fs.existsSync(documentPath);

    // Construir respuesta
    const response: any = {
      success: true,
      hasDocument,
      folio_formato: folioFormato,
    };

    // Incluir metadatos adicionales si existe el documento
    if (hasDocument) {
      response.documentInfo = {
        path: `/uploads/salidas/formatos/${folioFormato}.pdf`,
        name: `${folioFormato}.pdf`,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

/**
 * Controlador para obtener un documento de un formato de entrega
 */
export const getFormatoDocument = async (req: Request, res: Response) => {
  try {
    const { folioFormato } = req.params;

    // Verificar que el formato existe
    const formato = await promette.rl_entrega_formato.findOne({
      where: { folio_formato: folioFormato },
      attributes: ["folio_formato"],
    });

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: "Formato de entrega no encontrado",
      });
    }

    // Construir la ruta del documento
    const uploadsPath =
      process.env.UPLOADS_PATH || path.join(__dirname, "..", "..", "uploads");
    const filePath = path.join(
      uploadsPath,
      "salidas",
      "formatos",
      `${folioFormato}.pdf`
    );

    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "El documento no se encuentra en el servidor",
      });
    }

    // Enviar el archivo al cliente
    return res.status(200).sendFile(filePath);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

/**
 * Controlador para subir un documento asociado a un formato de entrega
 */
export const uploadFormatoDocument = async (req: Request, res: Response) => {
  try {
    const { folioFormato } = req.params;

    // Verificar que el formato existe
    const formato = await promette.rl_entrega_formato.findOne({
      where: { folio_formato: folioFormato },
    });

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: "Formato de entrega no encontrado",
      });
    }

    // Procesar el archivo subido usando el helper
    const uploadResult = handleUpload(req);

    // Devolver respuesta exitosa
    return res.status(200).json({
      success: true,
      message: "Documento subido correctamente",
      data: {
        ...uploadResult,
        folio_formato: folioFormato,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};
