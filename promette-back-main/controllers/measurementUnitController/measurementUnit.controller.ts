import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todas las unidades de medida
export const getAllMeasurementUnits = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todas las unidades de medida de la base de datos
    const units = await promette.ct_unidad_medida.findAll({
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles",
        },
      ],
    });

    if (units.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron unidades de medida",
      });
    }

    return res.status(200).json({
      units,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las unidades de medida",
    });
  }
};

// Controlador para obtener una unidad de medida por ID
export const getMeasurementUnitById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_unidad } = req.params;

  try {
    // Buscar una unidad de medida por su ID
    const unit = await promette.ct_unidad_medida.findByPk(id_unidad, {
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles",
        },
      ],
    });

    if (!unit) {
      return res.status(404).json({
        msg: "Unidad de medida no encontrada",
      });
    }

    return res.status(200).json({
      unit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la unidad de medida",
    });
  }
};

// Controlador para crear una nueva unidad de medida
export const createMeasurementUnit = async (req: Request, res: Response) => {
  const {
    clave_unidad,
    nombre_unidad,
  } = req.body;

  try {
    // Verificar si ya existe una unidad de medida con la misma clave
    if (clave_unidad) {
      const existingUnit = await promette.ct_unidad_medida.findOne({
        where: { clave_unidad },
      });

      if (existingUnit) {
        return res.status(400).json({
          msg: "Ya existe una unidad de medida con esa clave",
        });
      }
    }

    // Crear una nueva unidad de medida
    const newUnit = await promette.ct_unidad_medida.create({
      clave_unidad,
      nombre_unidad,
    });

    return res.status(201).json({
      msg: "Unidad de medida creada correctamente",
      unit: newUnit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al crear la unidad de medida",
    });
  }
};

// Controlador para actualizar una unidad de medida
export const updateMeasurementUnit = async (req: Request, res: Response) => {
  const { id_unidad } = req.params;
  const {
    clave_unidad,
    nombre_unidad,
  } = req.body;

  try {
    // Verificar si la unidad de medida existe
    const unit = await promette.ct_unidad_medida.findByPk(id_unidad);
    
    if (!unit) {
      return res.status(404).json({
        msg: "Unidad de medida no encontrada",
      });
    }

    // Verificar si ya existe otra unidad de medida con la misma clave
    if (clave_unidad) {
      const existingUnit = await promette.ct_unidad_medida.findOne({
        where: { 
          clave_unidad,
          id_unidad: { [Op.ne]: id_unidad }
        },
      });

      if (existingUnit) {
        return res.status(400).json({
          msg: "Ya existe otra unidad de medida con esa clave",
        });
      }
    }

    // Actualizar la unidad de medida
    await promette.ct_unidad_medida.update(
      {
        clave_unidad,
        nombre_unidad,
      },
      {
        where: { id_unidad },
      }
    );

    // Obtener la unidad de medida actualizada
    const updatedUnit = await promette.ct_unidad_medida.findByPk(id_unidad, {
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles",
        },
      ],
    });

    return res.status(200).json({
      msg: "Unidad de medida actualizada correctamente",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar la unidad de medida",
    });
  }
};

// Controlador para eliminar una unidad de medida
export const deleteMeasurementUnit = async (req: Request, res: Response) => {
  const { id_unidad } = req.params;

  try {
    // Verificar si la unidad de medida existe
    const unit = await promette.ct_unidad_medida.findByPk(id_unidad);
    
    if (!unit) {
      return res.status(404).json({
        msg: "Unidad de medida no encontrada",
      });
    }

    // Verificar si hay productos asociados a esta unidad de medida
    const associatedProducts = await promette.ct_producto_consumible.findAll({
      where: { ct_unidad_id: id_unidad },
    });

    if (associatedProducts.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar la unidad de medida porque tiene productos asociados",
      });
    }

    // Verificar si hay inventarios asociados a esta unidad de medida
    const associatedInventories = await promette.dt_consumible_inventario.findAll({
      where: { ct_unidad_id: id_unidad },
    });

    if (associatedInventories.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar la unidad de medida porque tiene inventarios asociados",
      });
    }

    // Eliminar la unidad de medida
    await promette.ct_unidad_medida.destroy({
      where: { id_unidad },
    });

    return res.status(200).json({
      msg: "Unidad de medida eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar la unidad de medida",
    });
  }
};
