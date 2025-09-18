import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todos los municipios
export const getAllMunicipalities = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los municipios de la base de datos
    const municipalities = await promette.ct_municipio.findAll({
      order: [["municipio", "ASC"]], // Ordenar alfabéticamente
    });

    if (municipalities.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron municipios",
      });
    }

    return res.status(200).json({
      municipalities,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los municipios",
    });
  }
};

// Controlador para obtener un municipio por ID
export const getMunicipalityById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_municipio } = req.params;

  try {
    // Buscar un municipio por su ID
    const municipality = await promette.ct_municipio.findByPk(id_municipio);

    if (!municipality) {
      return res.status(404).json({
        msg: "Municipio no encontrado",
      });
    }

    return res.status(200).json({
      municipality,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el municipio",
    });
  }
};

// Controlador para crear un nuevo municipio
export const createMunicipality = async (req: Request, res: Response) => {
  const { municipio } = req.body;

  try {
    // Verificar si ya existe un municipio con el mismo nombre
    const existingMunicipality = await promette.ct_municipio.findOne({
      where: { municipio },
    });

    if (existingMunicipality) {
      return res.status(400).json({
        msg: "Ya existe un municipio con ese nombre",
      });
    }

    // Crear un nuevo municipio
    const newMunicipality = await promette.ct_municipio.create({
      municipio,
    });

    return res.status(201).json({
      msg: "Municipio creado correctamente",
      municipality: newMunicipality,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al crear el municipio",
    });
  }
};

// Controlador para actualizar un municipio
export const updateMunicipality = async (req: Request, res: Response) => {
  const { id_municipio } = req.params;
  const { municipio } = req.body;

  try {
    // Verificar si el municipio existe
    const municipality = await promette.ct_municipio.findByPk(id_municipio);
    
    if (!municipality) {
      return res.status(404).json({
        msg: "Municipio no encontrado",
      });
    }

    // Verificar si ya existe otro municipio con el mismo nombre
    const existingMunicipality = await promette.ct_municipio.findOne({
      where: { 
        municipio,
        id_municipio: { [Op.ne]: id_municipio }
      },
    });

    if (existingMunicipality) {
      return res.status(400).json({
        msg: "Ya existe otro municipio con ese nombre",
      });
    }

    // Actualizar el municipio
    await promette.ct_municipio.update(
      {
        municipio,
      },
      {
        where: { id_municipio },
      }
    );

    // Obtener el municipio actualizado
    const updatedMunicipality = await promette.ct_municipio.findByPk(id_municipio);

    return res.status(200).json({
      msg: "Municipio actualizado correctamente",
      municipality: updatedMunicipality,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el municipio",
    });
  }
};

// Controlador para eliminar un municipio
export const deleteMunicipality = async (req: Request, res: Response) => {
  const { id_municipio } = req.params;

  try {
    // Verificar si el municipio existe
    const municipality = await promette.ct_municipio.findByPk(id_municipio);
    
    if (!municipality) {
      return res.status(404).json({
        msg: "Municipio no encontrado",
      });
    }

    // Verificar si hay aspirantes asociados a este municipio
    const associatedAspirants = await promette.dt_aspirante_aneec.findAll({
      where: { ct_municipio_id: id_municipio },
    });

    if (associatedAspirants.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el municipio porque tiene aspirantes asociados",
      });
    }

    // Verificar si hay diagnósticos asociados a este municipio
    const associatedDiagnostics = await promette.dt_diagnostico_aneec.findAll({
      where: { ct_municipio_id: id_municipio },
    });

    if (associatedDiagnostics.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el municipio porque tiene diagnósticos asociados",
      });
    }

    // Eliminar el municipio
    await promette.ct_municipio.destroy({
      where: { id_municipio },
    });

    return res.status(200).json({
      msg: "Municipio eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el municipio",
    });
  }
};
