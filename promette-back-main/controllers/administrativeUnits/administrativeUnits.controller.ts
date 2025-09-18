import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import axios from "axios";
import { Op } from "sequelize";



// Función auxiliar para obtener áreas de la API de infraestructura
export const getInfrastructureAreas = async () => {
  try {
    const response = await axios.get(`${process.env.INFRAESTRUCTURA_API}/area`);

    if (response.data && Array.isArray(response.data)) {
      // Crear un mapa para acceso rápido por ID
      const areasMap = new Map();
      response.data.forEach((area: any) => {
        areasMap.set(area.id_area, area.nombre);
      });
      return areasMap;
    }
    return new Map();
  } catch (error) {
    console.error("Error al obtener áreas de infraestructura:", error);
    return new Map();
  }
};

// Controlador para obtener todas las unidades administrativas
export const obtenerTodasLasUnidadesAdministrativas = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener el año actual
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Obtener todas las unidades administrativas de la base de datos del año actual
    const administrativeUnits = await promette.rl_area_financiero.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfYear, endOfYear]
        }
      },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario_in_ct_usuario",
          attributes: ["nombre_usuario"],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuario_at_ct_usuario",
          attributes: ["nombre_usuario"],
        },
      ],
    });

    if (administrativeUnits.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron unidades administrativas",
      });
    }

    // Obtener las áreas de infraestructura
    const areasMap = await getInfrastructureAreas();

    // Añadir el nombre del área a cada unidad administrativa
    const unitsWithAreaName = administrativeUnits.map((unit: any) => {
      const unitJson = unit.toJSON();
      return {
        ...unitJson,
        nombre: areasMap.get(unitJson.id_area_infra) || "Área no encontrada",
      };
    });

    return res.status(200).json({
      administrativeUnits: unitsWithAreaName,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({
      msg: "Error al obtener las unidades administrativas",
    });
  }
};

// Controlador para obtener una unidad administrativa por ID
export const obtenerUnidadAdministrativaPorId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area_fin } = req.params;

  try {
    // Buscar una unidad administrativa por su ID
    const administrativeUnit = await promette.rl_area_financiero.findByPk(
      id_area_fin,
      {
        include: [
          {
            model: promette.ct_usuario,
            as: "ct_usuario_in_ct_usuario",
            attributes: ["nombre_usuario"],
          },
          {
            model: promette.ct_usuario,
            as: "ct_usuario_at_ct_usuario",
            attributes: ["nombre_usuario"],
          },
        ],
      }
    );

    if (!administrativeUnit) {
      return res.status(404).json({
        msg: "Unidad administrativa no encontrada",
      });
    }

    // Obtener las áreas de infraestructura
    const areasMap = await getInfrastructureAreas();

    // Añadir el nombre del área a la unidad administrativa
    const unitWithAreaName = {
      ...administrativeUnit.toJSON(),
      nombre:
        areasMap.get(administrativeUnit.id_area_infra) || "Área no encontrada",
    };

    return res.status(200).json({
      administrativeUnit: unitWithAreaName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la unidad administrativa",
    });
  }
};

// Controlador para registrar una nueva unidad administrativa
export const registrarUnidadAdministrativa = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_financiero, id_area_infra, ct_usuario_in } = req.body;

  try {
    // Verificar si ya existe una relación con esos IDs
    const existingUnit = await promette.rl_area_financiero.findOne({
      where: {
        id_financiero,
        id_area_infra,
      },
    });

    if (existingUnit) {
      return res.status(400).json({
        msg: "Ya existe una unidad administrativa con estos datos",
      });
    }

    // Crear la nueva unidad administrativa
    const newAdministrativeUnit = await promette.rl_area_financiero.create({
      id_financiero,
      id_area_infra,
      ct_usuario_in,
    });

    return res.status(201).json({
      msg: "Unidad administrativa registrada correctamente",
      administrativeUnit: newAdministrativeUnit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al registrar la unidad administrativa",
    });
  }
};

// Controlador para actualizar una unidad administrativa
export const actualizarUnidadAdministrativa = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area_fin, id_financiero, id_area_infra, ct_usuario_at } = req.body;

  try {
    // Verificar si la unidad administrativa existe
    const administrativeUnit = await promette.rl_area_financiero.findByPk(
      id_area_fin
    );

    if (!administrativeUnit) {
      return res.status(404).json({
        msg: "Unidad administrativa no encontrada",
      });
    }

    // Actualizar la unidad administrativa
    const updatedUnit = await promette.rl_area_financiero.update(
      {
        id_financiero,
        id_area_infra,
        ct_usuario_at,
      },
      {
        where: { id_area_fin },
      }
    );

    if (!updatedUnit[0]) {
      return res.status(400).json({
        msg: "Error en la actualización",
      });
    }

    return res.status(200).json({
      msg: "success",
      administrativeUnit: updatedUnit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar la unidad administrativa",
    });
  }
};

// Controlador para eliminar una unidad administrativa
export const eliminarUnidadAdministrativa = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area_fin } = req.params;

  try {
    // Verificar si la unidad administrativa existe
    const administrativeUnit = await promette.rl_area_financiero.findByPk(
      id_area_fin
    );

    if (!administrativeUnit) {
      return res.status(404).json({
        msg: "Unidad administrativa no encontrada",
      });
    }

    await promette.rl_area_financiero.destroy({
      where: { id_area_fin },
    });

    return res.status(200).json({
      msg: "Unidad administrativa eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar la unidad administrativa",
    });
  }
};
