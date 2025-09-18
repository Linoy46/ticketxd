import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



/**
 * Sistema de bloqueo mutex para generación segura de folios
 */
let folioMutex = false;
let mutexQueue: (() => void)[] = [];

/**
 * Adquiere el mutex para operaciones de generación de folio
 * @returns Promise que resuelve cuando se obtiene acceso al mutex
 */
const acquireFolioMutex = async (): Promise<void> => {
  if (!folioMutex) {
    folioMutex = true;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    mutexQueue.push(() => resolve());
  });
};

/**
 * Libera el mutex después de una operación de generación de folio
 */
const releaseFolioMutex = (): void => {
  if (mutexQueue.length > 0) {
    const nextResolver = mutexQueue.shift();
    if (nextResolver) nextResolver();
  } else {
    folioMutex = false;
  }
};

/**
 * Cache para el último folio generado y su contador
 */
let lastFolioCache = {
  year: new Date().getFullYear(),
  counter: 0,
  prefix: `INV-${new Date().getFullYear()}-`,
  lastUpdate: new Date(),
};

/**
 * Genera un folio único usando un sistema de bloqueo mutex
 * @param forceRefresh Indica si se debe forzar la actualización desde la base de datos
 * @returns Folio generado (formato: INV-YEAR-XXXX)
 */
const generateFolioSafe = async (): Promise<string> => {
  try {
    await acquireFolioMutex();

    const today = new Date();
    const year = today.getFullYear();
    const prefix = `INV-${year}-`;
    const forceRefresh =
      year !== lastFolioCache.year ||
      new Date().getTime() - lastFolioCache.lastUpdate.getTime() > 5000 ||
      lastFolioCache.counter === 0;

    if (forceRefresh) {
      // Buscar el último folio con el prefijo actual
      const lastInventory = await promette.dt_consumible_inventario.findOne({
        where: {
          folio: {
            [Op.like]: `${prefix}%`,
          },
        },
        order: [["folio", "DESC"]],
      });

      let counter = 1;

      if (lastInventory) {
        const lastNumber = parseInt(
          lastInventory.folio.replace(prefix, ""),
          10
        );
        if (!isNaN(lastNumber)) {
          counter = lastNumber + 1;
        }
      }
      lastFolioCache = {
        year: year,
        counter: counter,
        prefix: prefix,
        lastUpdate: new Date(),
      };
    } else {
      lastFolioCache.counter++;
    }
    return `${prefix}${lastFolioCache.counter.toString().padStart(4, "0")}`;
  } finally {
    releaseFolioMutex();
  }
};

/**
 * Verifica si un folio ya existe en la base de datos
 * @param folio Folio a verificar
 * @returns true si el folio ya existe, false en caso contrario
 */
const folioExists = async (folio: string): Promise<boolean> => {
  const existingInventory = await promette.dt_consumible_inventario.findOne({
    where: { folio },
  });
  return !!existingInventory;
};

// Controlador para obtener todos los inventarios
export const getAllConsumableInventories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los inventarios de la base de datos
    const inventories = await promette.dt_consumible_inventario.findAll({
      include: [
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
        },
        {
          model: promette.ct_partida,
          as: "ct_partida",
        },
        {
          model: promette.ct_consumible_factura,
          as: "ct_factura",
          include: [
            {
              model: promette.ct_consumibles_proveedor,
              as: "ct_provedor",
            },
          ],
        },
      ],
    });

    if (inventories.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron inventarios",
      });
    }

    return res.status(200).json({
      inventories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los inventarios",
    });
  }
};

// Controlador para obtener un inventario por ID
export const getConsumableInventoryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_inventario } = req.params;

  try {
    // Buscar un inventario por su ID
    const inventory = await promette.dt_consumible_inventario.findByPk(
      id_inventario,
      {
        include: [
          {
            model: promette.ct_unidad_medida,
            as: "ct_unidad",
          },
          {
            model: promette.ct_partida,
            as: "ct_partida",
          },
          {
            model: promette.ct_consumible_factura,
            as: "ct_factura",
            include: [
              {
                model: promette.ct_consumibles_proveedor,
                as: "ct_provedor",
              },
            ],
          },
        ],
      }
    );

    if (!inventory) {
      return res.status(404).json({
        msg: "Inventario no encontrado",
      });
    }

    return res.status(200).json({
      inventory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el inventario",
    });
  }
};

/**
 * Crea un nuevo inventario con generación automática de folio
 */
export const createConsumableInventory = async (
  req: Request,
  res: Response
) => {
  const {
    descripcion,
    observaciones,
    cantidad,
    ct_partida_id,
    ct_unidad_id,
    ct_factura_id,
  } = req.body;

  try {
    // Generar un folio único usando el nuevo sistema con mutex
    const newFolio = await generateFolioSafe();

    // Verificación de datos relacionados
    const unit = await promette.ct_unidad_medida.findByPk(ct_unidad_id);
    if (!unit) {
      return res.status(400).json({
        msg: "La unidad de medida especificada no existe",
      });
    }

    const item = await promette.ct_partida.findByPk(ct_partida_id);
    if (!item) {
      return res.status(400).json({
        msg: "La partida especificada no existe",
      });
    }

    const invoice = await promette.ct_consumible_factura.findByPk(
      ct_factura_id
    );
    if (!invoice) {
      return res.status(400).json({
        msg: "La factura especificada no existe",
      });
    }

    // Crear un nuevo inventario con el folio generado
    const newInventory = await promette.dt_consumible_inventario.create({
      folio: newFolio,
      descripcion,
      observaciones,
      cantidad,
      resta: cantidad,
      ct_partida_id,
      ct_unidad_id,
      ct_factura_id,
    });

    return res.status(201).json({
      msg: "Inventario creado correctamente",
      inventory: newInventory,
    });
  } catch (error) {
    console.error("Error al crear el inventario");
    return res.status(500).json({
      msg: "Error al crear el inventario",
    });
  }
};

/**
 * Crea múltiples inventarios en lote con generación segura de folios
 */
export const createBatchConsumableInventory = async (
  req: Request,
  res: Response
) => {
  const inventoryItems = req.body.items;

  if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    return res.status(400).json({
      msg: "Se requiere un array de elementos para crear el lote",
    });
  }

  try {
    const createdItems = [];
    const errors = [];

    // Procesar cada elemento secuencialmente
    for (const item of inventoryItems) {
      const {
        descripcion,
        observaciones,
        cantidad,
        ct_partida_id,
        ct_unidad_id,
        ct_factura_id,
      } = item;

      try {
        // Verificaciones previas
        const unit = await promette.ct_unidad_medida.findByPk(ct_unidad_id);
        if (!unit) {
          errors.push({
            error: "La unidad de medida especificada no existe",
            item: item,
          });
          continue;
        }

        const itemObj = await promette.ct_partida.findByPk(ct_partida_id);
        if (!itemObj) {
          errors.push({
            error: "La partida especificada no existe",
            item: item,
          });
          continue;
        }

        const invoice = await promette.ct_consumible_factura.findByPk(
          ct_factura_id
        );
        if (!invoice) {
          errors.push({
            error: "La factura especificada no existe",
            item: item,
          });
          continue;
        }

        // Generar un folio único con protección de mutex
        let folio = await generateFolioSafe();
        let retries = 0;
        const maxRetries = 3;

        // Verificar que el folio no exista, con reintentos
        while ((await folioExists(folio)) && retries < maxRetries) {
          folio = await generateFolioSafe();
          retries++;
        }

        if (retries >= maxRetries) {
          errors.push({
            error:
              "No se pudo generar un folio único después de varios intentos",
            item: item,
          });
          continue;
        }

        // Crear un nuevo inventario con el folio generado
        const newInventory = await promette.dt_consumible_inventario.create({
          folio: folio,
          descripcion,
          observaciones,
          cantidad,
          resta: cantidad,
          ct_partida_id,
          ct_unidad_id,
          ct_factura_id,
        });

        createdItems.push(newInventory);
      } catch (error) {
        let errorMessage = "Error interno al procesar este elemento";
        let errorDetails = "Error desconocido";

        if (typeof error === "object" && error !== null) {
          const err = error as any;
          if (err.name === "SequelizeUniqueConstraintError") {
            errorMessage = "Error de duplicación de folio";
          }
          errorDetails = err.message || errorDetails;
        }

        errors.push({
          error: errorMessage,
          details: errorDetails,
          item: item,
        });
      }
    }

    return res.status(200).json({
      msg: `Procesamiento por lotes completado. Elementos creados: ${createdItems.length}, Errores: ${errors.length}`,
      createdItems,
      errors,
      success: createdItems.length > 0,
    });
  } catch (error) {
    console.error("Error en el procesamiento por lotes");
    return res.status(500).json({
      msg: "Error al procesar el lote de inventarios",
    });
  }
};

// Controlador para actualizar un inventario
export const updateConsumableInventory = async (
  req: Request,
  res: Response
) => {
  const { id_inventario } = req.params;
  const {
    folio,
    descripcion,
    observaciones,
    cantidad,
    ct_partida_id,
    ct_unidad_id,
    ct_factura_id,
    fecha,
  } = req.body;

  try {
    // Verificar si el inventario existe
    const inventory = await promette.dt_consumible_inventario.findByPk(
      id_inventario
    );

    if (!inventory) {
      return res.status(404).json({
        msg: "Inventario no encontrado",
      });
    }

    // Verificar si hay entregas asociadas
    const relatedDeliveries = await promette.dt_consumible_entrega.findAll({
      where: { dt_inventario_id: id_inventario },
    });

    if (
      relatedDeliveries.length > 0 &&
      Number(cantidad) < Number(inventory.cantidad) - Number(inventory.resta)
    ) {
      return res.status(400).json({
        msg: "No se puede reducir la cantidad por debajo de lo que ya se ha entregado",
      });
    }

    // Verificar si ya existe otro inventario con el mismo folio
    const existingInventory = await promette.dt_consumible_inventario.findOne({
      where: {
        folio,
        id_inventario: { [Op.ne]: id_inventario },
      },
    });

    if (existingInventory) {
      return res.status(400).json({
        msg: "Ya existe otro inventario con ese folio",
      });
    }

    // Calcular la nueva cantidad restante
    const oldQuantity = Number(inventory.cantidad);
    const newQuantity = Number(cantidad);
    const oldResta = Number(inventory.resta);

    // La nueva resta debe ajustarse proporcionalmente
    const deliveredAmount = oldQuantity - oldResta;
    const newResta = Math.max(0, newQuantity - deliveredAmount);

    // Preparar los datos de actualización
    const updateData: any = {
      folio,
      descripcion,
      observaciones,
      cantidad: newQuantity,
      resta: newResta,
      ct_partida_id,
      ct_unidad_id,
      ct_factura_id,
    };

    // Agregar fecha de creación solo si se proporciona
    if (fecha) {
      const fechaUsuario = new Date(fecha);
      const ahora = new Date();
      
      // Combinar la fecha del usuario con la hora actual del servidor
      fechaUsuario.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds());
      updateData.createdAt = fechaUsuario;
    }

    // Actualizar el inventario
    await promette.dt_consumible_inventario.update(
      updateData,
      {
        where: { id_inventario },
      }
    );

    // Obtener el inventario actualizado
    const updatedInventory = await promette.dt_consumible_inventario.findByPk(
      id_inventario,
      {
        include: [
          {
            model: promette.ct_unidad_medida,
            as: "ct_unidad",
          },
          {
            model: promette.ct_partida,
            as: "ct_partida",
          },
          {
            model: promette.ct_consumible_factura,
            as: "ct_factura",
            include: [
              {
                model: promette.ct_consumibles_proveedor,
                as: "ct_provedor",
              },
            ],
          },
        ],
      }
    );

    return res.status(200).json({
      msg: "Inventario actualizado correctamente",
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el inventario",
    });
  }
};

// Controlador para eliminar un inventario
export const deleteConsumableInventory = async (
  req: Request,
  res: Response
) => {
  const { id_inventario } = req.params;

  try {
    // Verificar si el inventario existe
    const inventory = await promette.dt_consumible_inventario.findByPk(
      id_inventario
    );

    if (!inventory) {
      return res.status(404).json({
        msg: "Inventario no encontrado",
      });
    }

    // Verificar si hay entregas asociadas a este inventario
    const associatedDeliveries = await promette.dt_consumible_entrega.findAll({
      where: { dt_inventario_id: id_inventario },
    });

    if (associatedDeliveries.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el inventario porque tiene entregas asociadas",
      });
    }

    // Eliminar el inventario
    await promette.dt_consumible_inventario.destroy({
      where: { id_inventario },
    });

    return res.status(200).json({
      msg: "Inventario eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el inventario",
    });
  }
};
