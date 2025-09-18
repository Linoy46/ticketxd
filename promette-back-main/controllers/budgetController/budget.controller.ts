import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Interfaz para el área del analista
interface AnalystArea {
  rl_area_financiero_rl_area_financiero?: {
    ct_financiamiento?: {
      id_financiamiento: number;
    };
  };
}

// Controlador para obtener todos los financiamientos
export const getAllFinanciamientos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id_usuario } = req.params;

    // Obtener el puesto actual del usuario
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { 
        ct_usuario_id: id_usuario,
        estado: 1,
        periodo_final: null // Puesto actual
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto"]
        }
      ]
    });

    // Si el usuario es jefe (puesto diferente a 258), mostrar todos los financiamientos
    if (!usuarioPuesto || usuarioPuesto.ct_puesto.id_puesto !== 258) {
      const financiamientos = await promette.ct_financiamiento.findAll({
        where: { estado: 1 },
      });

      return res.status(200).json({
        financiamientos,
      });
    }

    // Si es analista (puesto 258), obtener solo las áreas asignadas
    const areasAnalista = await promette.rl_analista_unidad.findAll({
      where: { 
        ct_usuario_id: id_usuario,
        estado: 1 
      },
      include: [
        {
          model: promette.rl_area_financiero,
          as: "rl_area_financiero_rl_area_financiero",
          required: true,
          include: [
            {
              model: promette.ct_financiamiento,
              as: "ct_financiamiento",
              where: { estado: 1 },
              required: true
            }
          ]
        }
      ]
    });

    // Extraer los financiamientos únicos de las áreas asignadas
    const financiamientosIds = new Set();
    areasAnalista.forEach((area: AnalystArea) => {
      if (area.rl_area_financiero_rl_area_financiero?.ct_financiamiento) {
        financiamientosIds.add(area.rl_area_financiero_rl_area_financiero.ct_financiamiento.id_financiamiento);
      }
    });

    const financiamientos = await promette.ct_financiamiento.findAll({
      where: { 
        id_financiamiento: Array.from(financiamientosIds),
        estado: 1 
      }
    });

    return res.status(200).json({
      financiamientos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los financiamientos",
    });
  }
};

// Controlador para obtener todos los financiamientos sin filtro de usuario
export const getAllFinanciamientosNoFilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los financiamientos activos
    const financiamientos = await promette.ct_financiamiento.findAll({
      where: { estado: 1 },
    });

    return res.status(200).json({
      financiamientos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los financiamientos",
    });
  }
};

// Controlador para obtener un financiamiento por ID
export const getFinanciamientoById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_financiamiento } = req.params;

  try {
    // Buscar un financiamiento por su ID
    const financiamiento = await promette.ct_financiamiento.findByPk(id_financiamiento);

    if (!financiamiento) {
      return res.status(404).json({
        msg: "Financiamiento no encontrado",
      });
    }

    return res.status(200).json({
      financiamiento,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el financiamiento",
    });
  }
};

// Controlador para crear un nuevo financiamiento
export const createFinanciamiento = async (req: Request, res: Response) => {
  const { nombre_financiamiento, estado } = req.body;

  try {
    // Verificar si ya existe un financiamiento con el mismo nombre
    const existingFinanciamiento = await promette.ct_financiamiento.findOne({
      where: { nombre_financiamiento }
    });

    if (existingFinanciamiento) {
      return res.status(400).json({
        msg: "Ya existe un financiamiento con ese nombre",
      });
    }

    // Crear nuevo financiamiento
    const newFinanciamiento = await promette.ct_financiamiento.create({
      nombre_financiamiento,
      estado
    });

    return res.status(201).json({
      msg: "Financiamiento creado correctamente",
      financiamiento: newFinanciamiento
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al crear el financiamiento",
    });
  }
};

// Controlador para actualizar un financiamiento
export const updateFinanciamiento = async (req: Request, res: Response) => {
  const { id_financiamiento, nombre_financiamiento, estado } = req.body;

  try {
    // Verificar si existe un financiamiento con el mismo nombre pero diferente ID
    const existingFinanciamiento = await promette.ct_financiamiento.findOne({
      where: { 
        nombre_financiamiento,
        id_financiamiento: { [Op.ne]: id_financiamiento }
      }
    });

    if (existingFinanciamiento) {
      return res.status(400).json({
        msg: "Ya existe un financiamiento con ese nombre",
      });
    }

    // Actualizar financiamiento
    const updatedFinanciamiento = await promette.ct_financiamiento.update(
      {
        nombre_financiamiento,
        estado,
      },
      {
        where: {
          id_financiamiento,
        },
      }
    );

    if (!updatedFinanciamiento[0]) {
      return res.status(404).json({
        msg: "No se encontró el financiamiento para actualizar",
      });
    }

    return res.status(200).json({
      msg: "Financiamiento actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el financiamiento",
    });
  }
};

// Controlador para eliminar (desactivar) un financiamiento
export const deleteFinanciamiento = async (req: Request, res: Response) => {
  const { id_financiamiento } = req.body;

  try {
    // Verificar si el financiamiento existe
    const financiamiento = await promette.ct_financiamiento.findByPk(id_financiamiento);
    
    if (!financiamiento) {
      return res.status(404).json({
        msg: "Financiamiento no encontrado",
      });
    }

    // Desactivar el financiamiento (cambiar estado a 0)
    await promette.ct_financiamiento.update(
      {
        estado: 0,
      },
      {
        where: {
          id_financiamiento,
        },
      }
    );

    return res.status(200).json({
      msg: "Financiamiento eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el financiamiento",
    });
  }
};

// Endpoint para obtener id_area_fin a partir de id_area_infra en rl_area_financiero
export const getIdAreaFinByInfra = async (req: Request, res: Response) => {
  const { id_area_infra } = req.params;

  if (isNaN(Number(id_area_infra))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const areasFin = await promette.rl_area_financiero.findAll({
      where: { id_area_infra: Number(id_area_infra) },
      attributes: ["id_area_fin", "id_area_infra"]
    });

    if (!areasFin || areasFin.length === 0) {
      return res.status(404).json({ msg: "No se encontraron áreas financieras para el área infra proporcionada" });
    }

    // Si solo quieres los IDs:
    // const ids = areasFin.map(a => a.id_area_fin);

    res.status(200).json({
      msg: "success",
      results: areasFin // o ids: ids
    });
  } catch (error) {
    console.error("Error al consultar rl_area_financiero por id_area_infra:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};
