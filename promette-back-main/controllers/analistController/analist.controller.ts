import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op, where } from "sequelize";
import { getInfrastructureAreas } from "../administrativeUnits/administrativeUnits.controller";



// Controlador para obtener todos los analistas
export const getAllAnalysts = async (
  req: Request,
  res: Response
): Promise<Response> => { 
  try {
    // Obtener todos los analistas activos de la base de datos
    const analysts = await promette.rl_analista_unidad.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["id_usuario","nombre_usuario", "email", "curp", "telefono"],
        },
        {
          model: promette.rl_area_financiero,
          as: "rl_area_financiero_rl_area_financiero",
          // required: false,
        },
      ],
    });

    if (analysts.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron analistas",
      });
    }

    return res.status(200).json({
      analysts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los analistas",
    });
  }
};

// Controlador para obtener un analista por ID
export const getAnalystById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_puesto_unidad } = req.params;

  try {
    // Buscar un analista por su ID
    const analyst = await promette.rl_analista_unidad.findByPk(
      id_puesto_unidad,
      {
        include: [
          {
            model: promette.ct_usuario,
            as: "ct_usuario",
            attributes: ["nombre_usuario", "email", "curp", "telefono"],
          },
          {
            model: promette.rl_area_financiero,
            as: "rl_area_financiero",
            required: false,
          },
        ],
      }
    );

    if (!analyst) {
      return res.status(404).json({
        msg: "Analista no encontrado",
      });
    }

    return res.status(200).json({
      analyst,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el analista",
    });
  }
};

// Controlador para obtener analistas por unidad administrativa
export const getAnalystsByAdministrativeUnit = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area_fin } = req.params;

  try {
    const analysts = await promette.rl_analista_unidad.findAll({
      where: { rl_area_financiero: id_area_fin, estado: 1 },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["nombre_usuario", "email", "curp", "telefono"],
        },
      ],
    });

    if (analysts.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron analistas para esta unidad administrativa",
      });
    }

    return res.status(200).json({
      analysts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los analistas",
    });
  }
};

// Controlador para registrar un nuevo analista
export const registerAnalyst = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    ct_usuario_id,
    rl_area_financiero_id,
    estado,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    // Crear o buscar el registro de analista
    const [newAnalyst, created] = await promette.rl_analista_unidad.findOrCreate({
      where: {rl_area_financiero: rl_area_financiero_id},
      defaults: {
        ct_usuario_id,
        rl_area_financiero: rl_area_financiero_id || null,
        estado: estado === 1 || estado === true,
        ct_usuario_in,
        ct_usuario_at,
      },
    });

    // Si el analista ya existe, enviar un mensaje de error
    if (!created) {
      return res.status(400).json({
        msg: "La unidad administrativa ya tiene asignado a un analista",
      });
    }

    // Respuesta en caso de éxito
    return res.status(201).json({
      msg: "Analista registrado correctamente",
      analyst: newAnalyst,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      msg: "Error al asignar un analista",
      error: errorMessage,
    });
  }
};

// Controlador para actualizar un analista
export const updateAnalyst = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    id_puesto_unidad,
    ct_usuario_id,
    rl_area_financiero_id,
    estado,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    // Verificar si el analista existe
    const analyst = await promette.rl_analista_unidad.findByPk(
      id_puesto_unidad
    );

    if (!analyst) {
      return res.status(404).json({
        msg: "Analista no encontrado",
      });
    }

    // Actualizar el analista
    const updatedAnalyst = await promette.rl_analista_unidad.update(
      {
        ct_usuario_id,
        rl_area_financiero: rl_area_financiero_id || null, // Use rl_area_financiero, not rl_area_financiero_id
        estado: estado === 1 || estado === true ? true : false,
        ct_usuario_in,
        ct_usuario_at,
        updatedAt: new Date(),
      },
      {
        where: { id_puesto_unidad },
      }
    );

    return res.status(200).json({
      msg: "Analista actualizado correctamente",
      analyst: updatedAnalyst,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el analista",
    });
  }
};

// Controlador para eliminar un analista (cambio de estado)
export const deleteAnalyst = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_puesto_unidad, ct_usuario_at } = req.body;

  try {
    // Verificar si el analista existe
    const analyst = await promette.rl_analista_unidad.findByPk(
      id_puesto_unidad
    );

    if (!analyst) {
      return res.status(404).json({
        msg: "Analista no encontrado",
      });
    }

    // Actualizar el estado del analista a inactivo
    await promette.rl_analista_unidad.update(
      {
        estado: 0,
        ct_usuario_at,
        updatedAt: new Date(),
      },
      {
        where: { id_puesto_unidad },
      }
    );

    return res.status(200).json({
      msg: "Analista eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el analista",
    });
  }
};

// Controlador para obtener áreas financieras por usuario analista
export const getAreasByAnalyst = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ct_usuario_id } = req.params;

  try {
    // Buscar todas las áreas financieras asignadas al analista
    const analystAreas = await promette.rl_analista_unidad.findAll({
      where: { 
        ct_usuario_id: ct_usuario_id,
        estado: 1 
      },
      include: [
        {
          model: promette.rl_area_financiero,
          as: "rl_area_financiero_rl_area_financiero",
          required: true,
          include: [
            {
              model: promette.ct_usuario,
              as: "ct_usuario_in_ct_usuario",
              attributes: ["nombre_usuario"],
            }
          ]
        }
      ]
    });

    if (analystAreas.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron áreas asignadas a este analista",
      });
    }

    // Obtener el mapa de áreas de infraestructura
    const areasMap = await getInfrastructureAreas();

    // Mapear las áreas con sus nombres
    const areasWithNames = analystAreas.map((analystArea: any) => {
      const areaFinanciera = analystArea.rl_area_financiero_rl_area_financiero;
      return {
        id_area_fin: areaFinanciera.id_area_fin,
        id_financiero: areaFinanciera.id_financiero,
        id_area_infra: areaFinanciera.id_area_infra,
        nombre: areasMap.get(areaFinanciera.id_area_infra) || "Área no encontrada",
        usuario_creacion: areaFinanciera.ct_usuario_in_ct_usuario?.nombre_usuario
      };
    });

    return res.status(200).json({
      areas: areasWithNames
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las áreas del analista",
    });
  }
};
