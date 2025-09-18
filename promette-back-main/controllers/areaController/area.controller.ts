import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



export const getAllAreas = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar las áreas con paginación usando Sequelize
    const areas = await promette.ct_area.findAndCountAll({
      include: [
        {
          model: promette.ct_departamento_sistema,
          as: "ct_departamento",
          attributes: ["id_departamento","nombre_departamento"],
        },
      ],
      where: { estado: 1, id_area: { [Op.ne]: 0 }, }, // Filtrar solo las áreas activas (estado: 1)
    });

    // Verificar si se encontraron áreas
    if (areas.count === 0) {
      res.status(404).json({ msg: "No se encontraron áreas" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      areas: areas.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getAreaById = async (req: Request, res: Response) => {
  const { id_area } = req.params;

  if (isNaN(Number(id_area))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const area = await promette.ct_area.findByPk(id_area, {
      include: [
        {
          model: promette.ct_departamento_sistema,
          as: "ct_departamento", // Asegúrate de que el alias coincida con la relación definida en el modelo
          attributes: ["nombre_departamento"],
        },
      ],
    });

    if (!area) {
      return res.status(404).json({ msg: "Área no encontrada" });
    }

    if (!area.estado) {
      return res.status(400).json({ msg: "Área no vigente" });
    }

    res.status(200).json({
      msg: "success",
      area,
    });
  } catch (error) {
    console.error("Error al obtener el área:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const registerArea = async (req: Request, res: Response) => {
  const { nombre_area, indice, ct_departamento_id, ct_usuario_in } = req.body;

  if (!nombre_area || !ct_departamento_id || !ct_usuario_in) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    const area = await promette.ct_area.create({
      nombre_area,
      indice,
      ct_departamento_id,
      ct_usuario_in,
      estado: 1,
    });

    res.status(201).json({
      msg: "Área creada exitosamente",
      area,
    });
  } catch (error) {
    console.error("Error al crear el área:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const updateArea = async (req: Request, res: Response) => {
  const {
    id_area,
    nombre_area,
    indice,
    ct_departamento_id,
    estado,
    ct_usuario_at,
  } = req.body;

  if (isNaN(Number(id_area))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const area = await promette.ct_area.findByPk(id_area);

    if (!area) {
      return res.status(404).json({ msg: "Área no encontrada" });
    }

    await area.update({
      nombre_area,
      indice,
      ct_departamento_id,
      estado,
      ct_usuario_at,
    });

    res.status(200).json({
      msg: "Área actualizada exitosamente",
      area,
    });
  } catch (error) {
    console.error("Error al actualizar el área:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  const {
    id_area,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentArea = await promette.ct_area.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_area,
        },
      }
    );

    if (!currentArea) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentArea,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};

// Obtener todas las áreas financieras (rl_area_financiero)
export const getAllAreasFinancieras = async (req: Request, res: Response) => {
  try {
    const areasFinancieras = await promette.rl_area_financiero.findAll({
      attributes: ['id_area_fin', 'id_financiero', 'id_area_infra', 'ct_usuario_in', 'ct_usuario_at', 'createdAt', 'updatedAt'],
      raw: true
    });
    res.status(200).json({ success: true, areasFinancieras });
  } catch (error) {
    console.error('Error al obtener áreas financieras:', error);
    res.status(500).json({ success: false, msg: 'Error al obtener áreas financieras', error });
  }
};

// Obtener áreas financieras asignadas a un analista
export const getAreasByAnalyst = async (req: Request, res: Response) => {
  const { id_usuario } = req.params;
  try {
    const areasAnalista = await promette.rl_analista_unidad.findAll({
      where: { ct_usuario_id: id_usuario, estado: 1 },
      include: [
        {
          model: promette.rl_area_financiero,
          as: "rl_area_financiero_rl_area_financiero",
          required: true
        }
      ]
    });
    if (areasAnalista.length === 0) {
      return res.status(404).json({ msg: "No se encontraron áreas asignadas a este analista" });
    }
    // Mapear solo los datos relevantes
    const result = areasAnalista.map((a: any) => {
      const area = a.rl_area_financiero_rl_area_financiero;
      return {
        id_area_fin: area.id_area_fin,
        id_financiero: area.id_financiero,
        id_area_infra: area.id_area_infra,
        nombre: area.nombre_area || area.id_area_fin // nombre_area si existe, si no el id
      };
    });
    return res.status(200).json({ areas: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al obtener las áreas del analista" });
  }
};