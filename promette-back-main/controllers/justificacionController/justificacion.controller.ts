import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// ✅ OPCIÓN SIMPLIFICADA PARA DEBUGGING
const getIncludeOptions = () => [
  {
    model: promette.rl_area_financiero,
    as: "ct_area",
    attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
    // ✅ TEMPORALMENTE SIN INCLUDE ANIDADO
    required: false,
  },
  {
    model: promette.ct_partida,
    as: "ct_partida",
    attributes: ["id_partida", "clave_partida", "nombre_partida"],
    required: false,
  },
  {
    model: promette.ct_usuario,
    as: "ct_usuario",
    attributes: ["id_usuario", "nombre_usuario"],
    required: false,
  },
  {
    model: promette.dt_techo_presupuesto,
    as: "dt_techo",
    attributes: ["id_techo", "cantidad_presupuestada"],
    required: false,
    include: [
      {
        model: promette.ct_financiamiento,
        as: "ct_financiamiento",
        attributes: ["id_financiamiento", "nombre_financiamiento"],
        required: false,
      }
    ]
  },  
];

// Controlador para obtener todas las justificaciones
export const getAllJustificaciones = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const justificaciones = await promette.rl_justificacion.findAll({
      include: getIncludeOptions(),
      order: [["createdAt", "DESC"]],
    });

    if (justificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No se encontraron justificaciones",
      });
    }

    return res.status(200).json({
      success: true,
      justificaciones,
      total: justificaciones.length,
    });
  } catch (error) {
    console.error("Error al obtener justificaciones:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener las justificaciones",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Controlador para obtener una justificación por ID
export const getJustificacionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_justificacion } = req.params;

  try {
    const justificacion = await promette.rl_justificacion.findByPk(
      id_justificacion,
      {
        include: getIncludeOptions(),
      }
    );

    if (!justificacion) {
      return res.status(404).json({
        success: false,
        msg: "Justificación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      justificacion,
    });
  } catch (error) {
    console.error("Error al obtener justificación:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getJustificacionesByTecho = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { techo_id } = req.params;

  try {
    const justificaciones = await promette.rl_justificacion.findAll({
      where: { dt_techo_id: techo_id },
      include: getIncludeOptions(),
      order: [["createdAt", "DESC"]],
    });

    if (justificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        msg: `No se encontraron justificaciones para el techo presupuestal ID ${techo_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      justificaciones,
      total: justificaciones.length,
      techo_id: parseInt(techo_id),
    });
  } catch (error) {
    console.error("Error al obtener justificaciones por techo:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener las justificaciones por techo presupuestal",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Controlador para obtener justificaciones por partida
export const getJustificacionesByPartida = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { partida_id } = req.params;

  try {
    const justificaciones = await promette.rl_justificacion.findAll({
      where: { ct_partida_id: partida_id },
      include: getIncludeOptions(),
      order: [["createdAt", "DESC"]],
    });

    if (justificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        msg: `No se encontraron justificaciones para la partida ID ${partida_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      justificaciones,
      total: justificaciones.length,
    });
  } catch (error) {
    console.error("Error al obtener justificaciones por partida:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener las justificaciones por partida",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Controlador para obtener justificaciones por área
export const getJustificacionesByArea = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { area_id } = req.params;

  try {
    const justificaciones = await promette.rl_justificacion.findAll({
      where: { ct_area_id: area_id },
      include: getIncludeOptions(),
      order: [["createdAt", "DESC"]],
    });

    if (justificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        msg: `No se encontraron justificaciones para el área ID ${area_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      justificaciones,
      total: justificaciones.length,
    });
  } catch (error) {
    console.error("Error al obtener justificaciones por área:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener las justificaciones por área",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
export const getJustificacionesByPartidaAndArea = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { partida_id, area_id } = req.params;
  const { techo_id } = req.query; // Parámetro opcional

  try {
    const whereClause: any = {
      ct_partida_id: partida_id,
      ct_area_id: area_id,
    };

    if (techo_id) {
      whereClause.dt_techo_id = techo_id;
    }

    const justificacion = await promette.rl_justificacion.findOne({
      where: whereClause,
      include: getIncludeOptions(),
    });

    if (!justificacion) {
      const techoMsg = techo_id ? ` y el techo ID ${techo_id}` : "";
      return res.status(404).json({
        success: false,
        msg: `No se encontró justificación para la partida ID ${partida_id}, el área ID ${area_id}${techoMsg}`,
      });
    }

    return res.status(200).json({
      success: true,
      justificacion,
    });
  } catch (error) {
    console.error("Error al obtener justificación:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const createJustificacion = async (req: Request, res: Response) => {
  const {
    ct_partida_id,
    ct_area_id,
    dt_techo_id,
    justificacion,
    ct_usuario_id,
  } = req.body;

  try {
    console.log("🔍 DATOS RECIBIDOS PARA CREAR JUSTIFICACIÓN:", {
      ct_partida_id,
      ct_area_id,
      dt_techo_id,
      justificacion,
      ct_usuario_id,
    });

    // ✅ VALIDACIÓN CRÍTICA: dt_techo_id NO PUEDE SER NULL O 1 (valor por defecto)
    if (!dt_techo_id || dt_techo_id <= 1) {
      console.error(`❌ Techo presupuestal inválido: ${dt_techo_id}`);
      return res.status(400).json({
        success: false,
        msg: `Techo presupuestal inválido (${dt_techo_id}). Se requiere un techo presupuestal válido para crear justificaciones.`,
        error_type: "INVALID_TECHO_PRESUPUESTAL",
        details: {
          received_techo_id: dt_techo_id,
          expected: "Un ID de techo presupuestal mayor a 1",
        },
      });
    }

    // ✅ VALIDACIÓN 1: Verificar que el techo presupuestal existe
    console.log(
      `🔍 Validando existencia del techo presupuestal ID: ${dt_techo_id}`
    );

    const techoPresupuestal = await promette.dt_techo_presupuesto.findByPk(
      dt_techo_id
    );
    if (!techoPresupuestal) {
      console.error(`❌ Techo presupuestal no encontrado: ${dt_techo_id}`);
      return res.status(400).json({
        success: false,
        msg: `El techo presupuestal con ID ${dt_techo_id} no existe en el sistema`,
        error_type: "TECHO_PRESUPUESTAL_NOT_FOUND",
      });
    }

    console.log(`✅ Techo presupuestal válido encontrado:`, {
      id_techo: techoPresupuestal.id_techo,
      ct_area_id: techoPresupuestal.ct_area_id,
      cantidad_presupuestada: techoPresupuestal.cantidad_presupuestada,
    });

    // ✅ VALIDACIÓN 2: Verificar que el área financiera existe
    const areaFinanciera = await promette.rl_area_financiero.findByPk(
      ct_area_id
    );
    if (!areaFinanciera) {
      console.error(`❌ Área financiera no encontrada: ${ct_area_id}`);
      return res.status(400).json({
        success: false,
        msg: `El área financiera con ID ${ct_area_id} no existe en el sistema`,
        error_type: "INVALID_AREA_FINANCIERA",
      });
    }

    // ✅ VALIDACIÓN 3: Verificar que la partida existe
    const partida = await promette.ct_partida.findByPk(ct_partida_id);
    if (!partida) {
      console.error(`❌ Partida no encontrada: ${ct_partida_id}`);
      return res.status(400).json({
        success: false,
        msg: `La partida con ID ${ct_partida_id} no existe en el sistema`,
        error_type: "INVALID_PARTIDA",
      });
    }

    console.log(`✅ Todas las validaciones completadas exitosamente`);

    const whereClause: any = {
      ct_partida_id,
      ct_area_id,
      dt_techo_id,
    };

    const existingJustificacion = await promette.rl_justificacion.findOne({
      where: whereClause,
    });

    if (existingJustificacion) {
      return res.status(400).json({
        success: false,
        msg: `Ya existe una justificación para la partida ${ct_partida_id}, área financiera ${ct_area_id} y techo presupuestal ${dt_techo_id}`,
        error_type: "DUPLICATE_JUSTIFICACION",
      });
    }

    // ✅ CREAR JUSTIFICACIÓN CON TECHO OBLIGATORIO
    const justificacionData = {
      ct_partida_id,
      ct_area_id,
      dt_techo_id, // ✅ NUNCA NULL
      justificacion,
      ct_usuario_id,
    };

    console.log(
      `📝 Creando justificación con datos validados:`,
      justificacionData
    );

    const newJustificacion = await promette.rl_justificacion.create(
      justificacionData
    );

    // Obtener la justificación completa con relaciones
    const justificacionCreada = await promette.rl_justificacion.findByPk(
      newJustificacion.id_justificacion,
      {
        include: getIncludeOptions(),
      }
    );

    console.log(`✅ Justificación creada exitosamente:`, {
      id_justificacion: newJustificacion.id_justificacion,
      ct_partida_id,
      ct_area_id,
      dt_techo_id,
    });

    return res.status(201).json({
      success: true,
      msg: "Justificación creada correctamente",
      justificacion: justificacionCreada,
    });
  } catch (error) {
    console.error("Error al crear justificación:", error);

    // ✅ MANEJO ESPECÍFICO DE ERRORES DE FOREIGN KEY
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      const fkError = error as any;

      if (fkError.fields && fkError.fields.includes("dt_techo_id")) {
        return res.status(400).json({
          success: false,
          msg: `El techo presupuestal con ID ${dt_techo_id} no existe en el sistema`,
          error_type: "FOREIGN_KEY_TECHO_PRESUPUESTAL",
        });
      }
    }

    return res.status(500).json({
      success: false,
      msg: "Error al crear la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const updateJustificacion = async (req: Request, res: Response) => {
  const { id_justificacion } = req.params;
  const {
    ct_partida_id,
    ct_area_id, // ✅ id_area_fin de rl_area_financiero
    dt_techo_id,
    justificacion,
    ct_usuario_id,
  } = req.body;

  try {
    // Verificar si la justificación existe
    const justificacionObj = await promette.rl_justificacion.findByPk(
      id_justificacion
    );

    if (!justificacionObj) {
      return res.status(404).json({
        success: false,
        msg: "Justificación no encontrada",
      });
    }

    // ✅ CORRECCIÓN: Validar área financiera si se proporciona
    if (ct_area_id) {
      console.log(
        `🔍 Validando área financiera para actualización: ${ct_area_id}`
      );

      const areaFinanciera = await promette.rl_area_financiero.findByPk(
        ct_area_id
      );
      if (!areaFinanciera) {
        return res.status(400).json({
          success: false,
          msg: `El área financiera con ID ${ct_area_id} no existe en el sistema`,
          error_type: "INVALID_AREA_FINANCIERA",
        });
      }
    }

    // ✅ Validar duplicados si se cambian las claves principales
    if (
      (ct_partida_id && ct_partida_id !== justificacionObj.ct_partida_id) ||
      (ct_area_id && ct_area_id !== justificacionObj.ct_area_id) ||
      (dt_techo_id !== undefined &&
        dt_techo_id !== justificacionObj.dt_techo_id)
    ) {
      const whereClause: any = {
        ct_partida_id: ct_partida_id || justificacionObj.ct_partida_id,
        ct_area_id: ct_area_id || justificacionObj.ct_area_id, // ✅ id_area_fin
        id_justificacion: { [Op.ne]: id_justificacion },
      };

      if (dt_techo_id !== undefined) {
        whereClause.dt_techo_id = dt_techo_id;
      }

      const existingJustificacion = await promette.rl_justificacion.findOne({
        where: whereClause,
      });

      if (existingJustificacion) {
        const techoMsg =
          dt_techo_id !== undefined ? ` y el techo ID ${dt_techo_id}` : "";
        return res.status(400).json({
          success: false,
          msg: `Ya existe una justificación para la partida ID ${
            ct_partida_id || justificacionObj.ct_partida_id
          }, el área financiera ID ${
            ct_area_id || justificacionObj.ct_area_id
          }${techoMsg}`,
        });
      }
    }

    const updateData: any = {};
    if (ct_partida_id !== undefined) updateData.ct_partida_id = ct_partida_id;
    if (ct_area_id !== undefined) updateData.ct_area_id = ct_area_id; // ✅ id_area_fin
    if (dt_techo_id !== undefined) updateData.dt_techo_id = dt_techo_id;
    if (justificacion !== undefined) updateData.justificacion = justificacion;
    if (ct_usuario_id !== undefined) updateData.ct_usuario_id = ct_usuario_id;

    await justificacionObj.update(updateData);

    // Obtener la justificación actualizada con relaciones
    const justificacionActualizada = await promette.rl_justificacion.findByPk(
      id_justificacion,
      {
        include: getIncludeOptions(),
      }
    );

    return res.status(200).json({
      success: true,
      msg: "Justificación actualizada correctamente",
      justificacion: justificacionActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar justificación:", error);

    // ✅ AÑADIR: Manejo específico de errores de foreign key
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      if (error.message.includes("rl_area_financiero")) {
        return res.status(400).json({
          success: false,
          msg: `El área financiera con ID ${ct_area_id} no es válida`,
          error_type: "FOREIGN_KEY_AREA_FINANCIERA",
        });
      }
    }

    return res.status(500).json({
      success: false,
      msg: "Error al actualizar la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Controlador para eliminar una justificación (sin cambios)
export const deleteJustificacion = async (req: Request, res: Response) => {
  const { id_justificacion } = req.params;

  try {
    const justificacion = await promette.rl_justificacion.findByPk(
      id_justificacion
    );

    if (!justificacion) {
      return res.status(404).json({
        success: false,
        msg: "Justificación no encontrada",
      });
    }

    await justificacion.destroy();

    return res.status(200).json({
      success: true,
      msg: "Justificación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar justificación:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al eliminar la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const upsertJustificacion = async (req: Request, res: Response) => {
  const {
    ct_partida_id,
    ct_area_id,
    dt_techo_id,
    justificacion,
    ct_usuario_id,
  } = req.body;

  try {
    console.log("🔍 DATOS RECIBIDOS PARA UPSERT JUSTIFICACIÓN:", {
      ct_partida_id,
      ct_area_id,
      dt_techo_id,
      justificacion: justificacion?.substring(0, 50) + "...",
      ct_usuario_id,
    });

    // ✅ VALIDACIÓN CRÍTICA: dt_techo_id NO PUEDE SER NULL O 1
    if (!dt_techo_id || dt_techo_id <= 1) {
      console.error(`❌ Techo presupuestal inválido en upsert: ${dt_techo_id}`);
      return res.status(400).json({
        success: false,
        msg: `Techo presupuestal inválido (${dt_techo_id}). Se requiere un techo presupuestal válido para las justificaciones.`,
        error_type: "INVALID_TECHO_PRESUPUESTAL",
        details: {
          received_techo_id: dt_techo_id,
          expected: "Un ID de techo presupuestal mayor a 1",
        },
      });
    }

    // ✅ VALIDACIONES PREVIAS (igual que en createJustificacion)
    const techoPresupuestal = await promette.dt_techo_presupuesto.findByPk(
      dt_techo_id
    );
    if (!techoPresupuestal) {
      return res.status(400).json({
        success: false,
        msg: `El techo presupuestal con ID ${dt_techo_id} no existe en el sistema`,
        error_type: "TECHO_PRESUPUESTAL_NOT_FOUND",
      });
    }

    const areaFinanciera = await promette.rl_area_financiero.findByPk(
      ct_area_id
    );
    if (!areaFinanciera) {
      return res.status(400).json({
        success: false,
        msg: `El área financiera con ID ${ct_area_id} no existe en el sistema`,
        error_type: "INVALID_AREA_FINANCIERA",
      });
    }

    const partida = await promette.ct_partida.findByPk(ct_partida_id);
    if (!partida) {
      return res.status(400).json({
        success: false,
        msg: `La partida con ID ${ct_partida_id} no existe en el sistema`,
        error_type: "INVALID_PARTIDA",
      });
    }

    const whereClause: any = {
      ct_partida_id,
      ct_area_id,
      dt_techo_id, // ✅ SIEMPRE INCLUIR TECHO
    };

    const existingJustificacion = await promette.rl_justificacion.findOne({
      where: whereClause,
    });

    const justificacionData = {
      justificacion,
      ct_usuario_id,
    };

    if (existingJustificacion) {
      // Si existe, actualizarla
      await existingJustificacion.update(justificacionData);

      const justificacionActualizada = await promette.rl_justificacion.findByPk(
        existingJustificacion.id_justificacion,
        {
          include: getIncludeOptions(),
        }
      );

      return res.status(200).json({
        success: true,
        msg: "Justificación actualizada correctamente",
        justificacion: justificacionActualizada,
        updated: true,
      });
    } else {
      // Si no existe, crearla
      const createData = {
        ct_partida_id,
        ct_area_id,
        dt_techo_id, // ✅ NUNCA NULL
        ...justificacionData,
      };

      console.log(`📝 Creando nueva justificación en upsert:`, createData);

      const newJustificacion = await promette.rl_justificacion.create(
        createData
      );

      const justificacionCreada = await promette.rl_justificacion.findByPk(
        newJustificacion.id_justificacion,
        {
          include: getIncludeOptions(),
        }
      );

      return res.status(201).json({
        success: true,
        msg: "Justificación creada correctamente",
        justificacion: justificacionCreada,
        created: true,
      });
    }
  } catch (error) {
    console.error("Error en upsertJustificacion:", error);

    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      const fkError = error as any;

      if (fkError.fields && fkError.fields.includes("dt_techo_id")) {
        return res.status(400).json({
          success: false,
          msg: `El techo presupuestal con ID ${dt_techo_id} no existe en el sistema`,
          error_type: "FOREIGN_KEY_TECHO_PRESUPUESTAL",
        });
      }
    }

    return res.status(500).json({
      success: false,
      msg: "Error al crear o actualizar la justificación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
