import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todos los proveedores
export const getAllConsumableProviders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los proveedores de la base de datos
    const providers = await promette.ct_consumibles_proveedor.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_consumible_factura,
          as: "ct_consumible_facturas",
        },
      ],
    });

    if (providers.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron proveedores",
      });
    }

    return res.status(200).json({
      providers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los proveedores",
    });
  }
};

// Controlador para obtener un proveedor por ID
export const getConsumableProviderById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_proveedor } = req.params;

  try {
    // Buscar un proveedor por su ID
    const provider = await promette.ct_consumibles_proveedor.findByPk(
      id_proveedor,
      {
        include: [
          {
            model: promette.ct_consumible_factura,
            as: "ct_consumible_facturas",
          },
        ],
      }
    );

    if (!provider) {
      return res.status(404).json({
        msg: "Proveedor no encontrado",
      });
    }

    return res.status(200).json({
      provider,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el proveedor",
    });
  }
};

/**
 * Controlador para crear un nuevo proveedor o reutilizar uno existente
 * @param req Solicitud HTTP con datos del proveedor
 * @param res Respuesta HTTP
 */
export const createConsumableProvider = async (req: Request, res: Response) => {
  const { razon_social, estado = 1 } = req.body;

  try {
    // Verificar si ya existe un proveedor con la misma razón social
    const existingProvider = await promette.ct_consumibles_proveedor.findOne({
      where: { razon_social },
    });

    // Si el proveedor ya existe, devolver ese proveedor en lugar de dar un error
    if (existingProvider) {
      return res.status(200).json({
        msg: "Se encontró un proveedor existente con la misma razón social",
        provider: existingProvider,
        existing: true,
      });
    }

    // Crear un nuevo proveedor
    const newProvider = await promette.ct_consumibles_proveedor.create({
      razon_social,
      estado,
    });

    return res.status(201).json({
      msg: "Proveedor creado correctamente",
      provider: newProvider,
      existing: false,
    });
  } catch (error) {
    console.error("Error al crear el proveedor");
    return res.status(500).json({
      msg: "Error al crear el proveedor",
    });
  }
};

// Controlador para actualizar un proveedor
export const updateConsumableProvider = async (req: Request, res: Response) => {
  const { id_proveedor } = req.params;
  const { razon_social, estado } = req.body;

  try {
    // Verificar si el proveedor existe
    const provider = await promette.ct_consumibles_proveedor.findByPk(
      id_proveedor
    );

    if (!provider) {
      return res.status(404).json({
        msg: "Proveedor no encontrado",
      });
    }

    // Verificar si ya existe otro proveedor con la misma razón social
    const existingProvider = await promette.ct_consumibles_proveedor.findOne({
      where: {
        razon_social,
        id_proveedor: { [Op.ne]: id_proveedor },
      },
    });

    if (existingProvider) {
      return res.status(400).json({
        msg: "Ya existe otro proveedor con esa razón social",
      });
    }

    // Actualizar el proveedor
    await promette.ct_consumibles_proveedor.update(
      {
        razon_social,
        estado,
      },
      {
        where: { id_proveedor },
      }
    );

    // Obtener el proveedor actualizado
    const updatedProvider = await promette.ct_consumibles_proveedor.findByPk(
      id_proveedor,
      {
        include: [
          {
            model: promette.ct_consumible_factura,
            as: "ct_consumible_facturas",
          },
        ],
      }
    );

    return res.status(200).json({
      msg: "Proveedor actualizado correctamente",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el proveedor",
    });
  }
};

// Controlador para eliminar un proveedor (cambiar estado a 0)
export const deleteConsumableProvider = async (req: Request, res: Response) => {
  const { id_proveedor } = req.params;

  try {
    // Verificar si el proveedor existe
    const provider = await promette.ct_consumibles_proveedor.findByPk(
      id_proveedor
    );

    if (!provider) {
      return res.status(404).json({
        msg: "Proveedor no encontrado",
      });
    }

    // Verificar si hay facturas asociadas a este proveedor
    const associatedInvoices = await promette.ct_consumible_factura.findAll({
      where: { ct_provedor_id: id_proveedor },
    });

    if (associatedInvoices.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el proveedor porque tiene facturas asociadas",
      });
    }

    // Actualizar el estado a 0 (eliminación lógica)
    await promette.ct_consumibles_proveedor.update(
      {
        estado: 0,
      },
      {
        where: { id_proveedor },
      }
    );

    return res.status(200).json({
      msg: "Proveedor eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el proveedor",
    });
  }
};
