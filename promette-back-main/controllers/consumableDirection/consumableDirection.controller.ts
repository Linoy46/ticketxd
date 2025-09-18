import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todas las direcciones de consumibles
export const getAllConsumableDirections = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todas las direcciones de la base de datos
    const directions = await promette.ct_consumible_direccion.findAll({
      include: [
        {
          model: promette.ct_consumible_departamento,
          as: "ct_consumible_departamentos",
        },
      ],
    });

    if (directions.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron direcciones",
      });
    }

    return res.status(200).json({
      directions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las direcciones",
    });
  }
};

// Controlador para obtener una dirección por ID
export const getConsumableDirectionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_direccion } = req.params;

  try {
    // Buscar una dirección por su ID
    const direction = await promette.ct_consumible_direccion.findByPk(id_direccion, {
      include: [
        {
          model: promette.ct_consumible_departamento,
          as: "ct_consumible_departamentos",
        },
      ],
    });

    if (!direction) {
      return res.status(404).json({
        msg: "Dirección no encontrada",
      });
    }

    return res.status(200).json({
      direction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la dirección",
    });
  }
};

// Controlador para crear una nueva dirección
export const createConsumableDirection = async (req: Request, res: Response) => {
  const {
    nombre_direccion,
    ct_puesto_id,
  } = req.body;

  try {
    // Verificar si ya existe una dirección con el mismo nombre
    const existingDirection = await promette.ct_consumible_direccion.findOne({
      where: { nombre_direccion },
    });

    if (existingDirection) {
      return res.status(400).json({
        msg: "Ya existe una dirección con ese nombre",
      });
    }

    // Crear una nueva dirección
    const newDirection = await promette.ct_consumible_direccion.create({
      nombre_direccion,
      ct_puesto_id,
    });

    return res.status(201).json({
      msg: "Dirección creada correctamente",
      direction: newDirection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al crear la dirección",
    });
  }
};

// Controlador para actualizar una dirección
export const updateConsumableDirection = async (req: Request, res: Response) => {
  const { id_direccion } = req.params;
  const {
    nombre_direccion,
    ct_puesto_id,
  } = req.body;

  try {
    // Verificar si la dirección existe
    const direction = await promette.ct_consumible_direccion.findByPk(id_direccion);
    
    if (!direction) {
      return res.status(404).json({
        msg: "Dirección no encontrada",
      });
    }

    // Verificar si ya existe otra dirección con el mismo nombre
    const existingDirection = await promette.ct_consumible_direccion.findOne({
      where: { 
        nombre_direccion,
        id_direccion: { [Op.ne]: id_direccion }
      },
    });

    if (existingDirection) {
      return res.status(400).json({
        msg: "Ya existe otra dirección con ese nombre",
      });
    }

    // Actualizar la dirección
    await promette.ct_consumible_direccion.update(
      {
        nombre_direccion,
        ct_puesto_id,
      },
      {
        where: { id_direccion },
      }
    );

    // Obtener la dirección actualizada
    const updatedDirection = await promette.ct_consumible_direccion.findByPk(id_direccion, {
      include: [
        {
          model: promette.ct_consumible_departamento,
          as: "ct_consumible_departamentos",
        },
      ],
    });

    return res.status(200).json({
      msg: "Dirección actualizada correctamente",
      direction: updatedDirection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar la dirección",
    });
  }
};

// Controlador para eliminar una dirección
export const deleteConsumableDirection = async (req: Request, res: Response) => {
  const { id_direccion } = req.params;

  try {
    // Verificar si la dirección existe
    const direction = await promette.ct_consumible_direccion.findByPk(id_direccion);
    
    if (!direction) {
      return res.status(404).json({
        msg: "Dirección no encontrada",
      });
    }

    // Verificar si hay departamentos asociados a esta dirección
    const associatedDepartments = await promette.ct_consumible_departamento.findAll({
      where: { ct_direccion_id: id_direccion },
    });

    if (associatedDepartments.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar la dirección porque tiene departamentos asociados",
      });
    }

    // Eliminar la dirección
    await promette.ct_consumible_direccion.destroy({
      where: { id_direccion },
    });

    return res.status(200).json({
      msg: "Dirección eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar la dirección",
    });
  }
};
