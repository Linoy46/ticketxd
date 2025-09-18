import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todas las facturas
export const getAllConsumableInvoices = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todas las facturas de la base de datos
    const invoices = await promette.ct_consumible_factura.findAll({
      include: [
        {
          model: promette.ct_consumibles_proveedor,
          as: "ct_provedor",
        },
        {
          model: promette.dt_consumible_inventario,
          as: "dt_consumible_inventarios",
        },
      ],
    });

    if (invoices.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron facturas",
      });
    }

    return res.status(200).json({
      invoices,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las facturas",
    });
  }
};

// Controlador para obtener una factura por ID
export const getConsumableInvoiceById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_factura } = req.params;

  try {
    // Buscar una factura por su ID
    const invoice = await promette.ct_consumible_factura.findByPk(id_factura, {
      include: [
        {
          model: promette.ct_consumibles_proveedor,
          as: "ct_provedor",
        },
        {
          model: promette.dt_consumible_inventario,
          as: "dt_consumible_inventarios",
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    return res.status(200).json({
      invoice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la factura",
    });
  }
};

/**
 * Controlador para crear una nueva factura
 * @param req Solicitud HTTP con datos de la factura
 * @param res Respuesta HTTP
 */
export const createConsumableInvoice = async (req: Request, res: Response) => {
  const { factura, ct_provedor_id } = req.body;

  try {
    // Verificar si ya existe una factura con el mismo número para el mismo proveedor
    const existingInvoice = await promette.ct_consumible_factura.findOne({
      where: { factura, ct_provedor_id },
    });

    if (existingInvoice) {
      return res.status(400).json({
        msg: "Ya existe una factura con ese número para este proveedor",
      });
    }

    // Verificar si el proveedor existe
    const provider = await promette.ct_consumibles_proveedor.findByPk(
      ct_provedor_id
    );

    if (!provider) {
      return res.status(400).json({
        msg: "El proveedor especificado no existe",
      });
    }

    // Crear una nueva factura
    const newInvoice = await promette.ct_consumible_factura.create({
      factura,
      ct_provedor_id,
    });

    return res.status(201).json({
      msg: "Factura creada correctamente",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error al crear la factura");
    return res.status(500).json({
      msg: "Error al crear la factura",
    });
  }
};

// Controlador para actualizar una factura
export const updateConsumableInvoice = async (req: Request, res: Response) => {
  const { id_factura } = req.params;
  const { factura, ct_provedor_id } = req.body;

  try {
    // Verificar si la factura existe
    const invoice = await promette.ct_consumible_factura.findByPk(id_factura);

    if (!invoice) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    // Verificar si ya existe otra factura con el mismo número para el mismo proveedor
    const existingInvoice = await promette.ct_consumible_factura.findOne({
      where: {
        factura,
        ct_provedor_id,
        id_factura: { [Op.ne]: id_factura },
      },
    });

    if (existingInvoice) {
      return res.status(400).json({
        msg: "Ya existe otra factura con ese número para este proveedor",
      });
    }

    // Verificar si el proveedor existe
    const provider = await promette.ct_consumibles_proveedor.findByPk(
      ct_provedor_id
    );

    if (!provider) {
      return res.status(400).json({
        msg: "El proveedor especificado no existe",
      });
    }

    // Actualizar la factura
    await promette.ct_consumible_factura.update(
      {
        factura,
        ct_provedor_id,
      },
      {
        where: { id_factura },
      }
    );

    // Obtener la factura actualizada
    const updatedInvoice = await promette.ct_consumible_factura.findByPk(
      id_factura,
      {
        include: [
          {
            model: promette.ct_consumibles_proveedor,
            as: "ct_provedor",
          },
        ],
      }
    );

    return res.status(200).json({
      msg: "Factura actualizada correctamente",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar la factura",
    });
  }
};

// Controlador para eliminar una factura
export const deleteConsumableInvoice = async (req: Request, res: Response) => {
  const { id_factura } = req.params;

  try {
    // Verificar si la factura existe
    const invoice = await promette.ct_consumible_factura.findByPk(id_factura);

    if (!invoice) {
      return res.status(404).json({
        msg: "Factura no encontrada",
      });
    }

    // Verificar si hay inventarios asociados a esta factura
    const associatedInventories =
      await promette.dt_consumible_inventario.findAll({
        where: { ct_factura_id: id_factura },
      });

    if (associatedInventories.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar la factura porque tiene inventarios asociados",
      });
    }

    // Eliminar la factura
    await promette.ct_consumible_factura.destroy({
      where: { id_factura },
    });

    return res.status(200).json({
      msg: "Factura eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar la factura",
    });
  }
};
