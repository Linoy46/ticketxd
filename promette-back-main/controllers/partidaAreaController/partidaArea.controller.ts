import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



export class PartidaAreaController {
  /**
   * Obtener todas las relaciones partida-área con paginación
   */
  static async obtenerTodasLasRelaciones(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { page = 1, limit = 10, id_area_fin, id_partida } = req.query;

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const whereClause: any = {};
      if (id_area_fin)
        whereClause.id_area_infra = parseInt(id_area_fin as string);
      if (id_partida) whereClause.id_partida = parseInt(id_partida as string);

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { count, rows } = await promette.rl_partida_area.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit as string),
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        msg: "Relaciones partida-área obtenidas exitosamente",
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      console.error("Error al obtener relaciones partida-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener partidas permitidas para una unidad administrativa específica
   */
  static async obtenerPartidasPorArea(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área financiera es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Obtener las relaciones de partida-área para esta área
      const relacionesPartidaArea = await promette.rl_partida_area.findAll({
        where: {
          id_area_infra: parseInt(id_area_fin)
        },
        include: [
          {
            model: promette.ct_partida,
            as: "id_partida_ct_partida",
            attributes: ["id_partida", "clave_partida", "nombre_partida", "estado"],
            where: { estado: 1 }
          }
        ],
        order: [[{ model: promette.ct_partida, as: "id_partida_ct_partida" }, "clave_partida", "ASC"]]
      });

      return res.status(200).json({
        success: true,
        msg: "Partidas obtenidas exitosamente",
        partidas: relacionesPartidaArea,
        total: relacionesPartidaArea.length,
      });
    } catch (error: any) {
      console.error("Error al obtener partidas por área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener áreas que tienen acceso a una partida específica
   */
  static async obtenerAreasPorPartida(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_partida } = req.params;

      if (!id_partida) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la partida es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const areasConAcceso = await promette.rl_partida_area.findAll({
        where: {
          id_partida: parseInt(id_partida),
        },
        include: [
          {
            model: promette.rl_area_financiero,
            as: "id_area_infra_rl_area_financiero",
            include: [
              {
                model: promette.rl_area_financiero,
                as: "id_area_infra_rl_area_financiero",
                attributes: [
                  "id_area_fin",
                  "id_financiero",
                  "id_area_infra",
                  "nombre_area",
                ],
              },
            ],
          },
          {
            model: promette.ct_partida,
            as: "id_partida_ct_partida",
            attributes: ["id_partida", "clave_partida", "nombre_partida"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        msg: "Áreas con acceso a la partida obtenidas exitosamente",
        areas: areasConAcceso,
        total: areasConAcceso.length,
      });
    } catch (error: any) {
      console.error("Error al obtener áreas por partida:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener una relación partida-área por ID
   */
  static async obtenerRelacionPorId(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_partida_area } = req.params;

      if (!id_partida_area) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la relación partida-área es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const relacion = await promette.rl_partida_area.findByPk(
        id_partida_area,
        {
          include: [
            {
              model: promette.ct_partida,
              as: "id_partida_ct_partida",
              attributes: [
                "id_partida",
                "clave_partida",
                "nombre_partida",
                "estado",
              ],
            },
            {
              model: promette.rl_area_financiero,
              as: "id_area_infra_rl_area_financiero",
              include: [
                {
                  model: promette.rl_area_financiero,
                  as: "id_area_infra_rl_area_financiero",
                  attributes: [
                    "id_area_fin",
                    "id_financiero",
                    "id_area_infra",
                    "nombre_area",
                  ],
                },
              ],
            },
          ],
        }
      );

      if (!relacion) {
        return res.status(404).json({
          success: false,
          msg: "Relación partida-área no encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        msg: "Relación partida-área obtenida exitosamente",
        relacion,
      });
    } catch (error: any) {
      console.error("Error al obtener relación por ID:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Crear una nueva relación partida-área
   */
  static async crearRelacion(req: Request, res: Response): Promise<Response> {
    try {
      const { id_area_fin, id_partida, ct_usuario_in } = req.body;

      if (!id_area_fin || !id_partida || !ct_usuario_in) {
        return res.status(400).json({
          success: false,
          msg: "Los campos id_area_infra, id_partida y ct_usuario_in son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Verificar que no exista ya la relación
      const relacionExistente = await promette.rl_partida_area.findOne({
        where: {
          id_area_infra: parseInt(id_area_fin),
          id_partida: parseInt(id_partida),
        },
      });

      if (relacionExistente) {
        return res.status(409).json({
          success: false,
          msg: "La partida ya está asignada a esta unidad administrativa",
        });
      }

      const area = await promette.rl_area_financiero.findByPk(
        parseInt(id_area_fin)
      );
      const partida = await promette.ct_partida.findByPk(parseInt(id_partida));

      if (!area) {
        return res.status(404).json({
          success: false,
          msg: "El área financiera no existe",
        });
      }

      if (!partida) {
        return res.status(404).json({
          success: false,
          msg: "La partida no existe",
        });
      }

      // Crear la nueva relación
      const nuevaRelacion = await promette.rl_partida_area.create({
        id_area_infra: parseInt(id_area_fin),
        id_partida: parseInt(id_partida),
        ct_usuario_in: parseInt(ct_usuario_in),
        createdAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        msg: "Partida asignada exitosamente al área financiera",
        relacion: nuevaRelacion,
      });
    } catch (error: any) {
      console.error("Error al crear relación partida-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Actualizar una relación partida-área existente
   */
  static async actualizarRelacion(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_partida_area } = req.params;
      const { id_area_fin, id_partida, ct_usuario_at } = req.body;

      if (!id_partida_area) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la relación partida-área es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const relacion = await promette.rl_partida_area.findByPk(id_partida_area);

      if (!relacion) {
        return res.status(404).json({
          success: false,
          msg: "La relación partida-área no existe",
        });
      }

      // Verificar si ya existe otra relación con los mismos datos (evitar duplicados)
      if (id_area_fin && id_partida) {
        const relacionDuplicada = await promette.rl_partida_area.findOne({
          where: {
            id_area_infra: parseInt(id_area_fin),
            id_partida: parseInt(id_partida),
            id_partida_area: { [Op.ne]: parseInt(id_partida_area) },
          },
        });

        if (relacionDuplicada) {
          return res.status(409).json({
            success: false,
            msg: "Ya existe una relación con estos datos",
          });
        }
      }

      // Actualizar la relación
      const datosActualizacion: any = {};
      if (id_area_fin) datosActualizacion.id_area_infra = parseInt(id_area_fin);
      if (id_partida) datosActualizacion.id_partida = parseInt(id_partida);
      if (ct_usuario_at)
        datosActualizacion.ct_usuario_at = parseInt(ct_usuario_at);

      await relacion.update(datosActualizacion);

      // Obtener la relación actualizada con sus asociaciones
      const relacionActualizada = await promette.rl_partida_area.findByPk(
        id_partida_area,
        {
          include: [
            {
              model: promette.ct_partida,
              as: "id_partida_ct_partida",
              attributes: [
                "id_partida",
                "clave_partida",
                "nombre_partida",
                "estado",
              ],
            },
            {
              model: promette.rl_area_financiero,
              as: "id_area_infra_rl_area_financiero",
              include: [
                {
                  model: promette.rl_area_financiero,
                  as: "id_area_infra_rl_area_financiero",
                  attributes: [
                    "id_area_fin",
                    "id_financiero",
                    "id_area_infra",
                    "nombre_area",
                  ],
                },
              ],
            },
          ],
        }
      );

      return res.status(200).json({
        success: true,
        msg: "Relación partida-área actualizada exitosamente",
        relacion: relacionActualizada,
      });
    } catch (error: any) {
      console.error("Error al actualizar relación partida-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Asignar múltiples partidas a una unidad administrativa
   */
  static async asignarMultiplesPartidas(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin, partidas, ct_usuario_in } = req.body;

      if (
        !id_area_fin ||
        !partidas ||
        !Array.isArray(partidas) ||
        !ct_usuario_in
      ) {
        return res.status(400).json({
          success: false,
          msg: "Los campos id_area_fin, partidas (array) y ct_usuario_in son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const area = await promette.rl_area_financiero.findByPk(
        parseInt(id_area_fin)
      );
      if (!area) {
        return res.status(404).json({
          success: false,
          msg: "El área financiera no existe",
        });
      }

      const relacionesCreadas = [];
      const errores = [];

      for (const id_partida of partidas) {
        try {
          // Verificar que no exista ya la relación
          const relacionExistente = await promette.rl_partida_area.findOne({
            where: {
              id_area_infra: parseInt(id_area_fin),
              id_partida: parseInt(id_partida),
            },
          });

          if (!relacionExistente) {
            const nuevaRelacion = await promette.rl_partida_area.create({
              id_area_infra: parseInt(id_area_fin),
              id_partida: parseInt(id_partida),
              ct_usuario_in: parseInt(ct_usuario_in),
            });
            relacionesCreadas.push(nuevaRelacion);
          } else {
            errores.push(`Partida ${id_partida} ya estaba asignada`);
          }
        } catch (error: any) {
          errores.push(`Error con partida ${id_partida}: ${error.message}`);
        }
      }

      return res.status(200).json({
        success: true,
        msg: "Proceso de asignación completado",
        data: {
          asignadas: relacionesCreadas,
          errores: errores,
        },
        total_asignadas: relacionesCreadas.length,
        total_errores: errores.length,
      });
    } catch (error: any) {
      console.error("Error al asignar múltiples partidas:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Verificar si una unidad administrativa tiene acceso a una partida específica
   */
  static async verificarAccesoPartida(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin, id_partida } = req.params;

      if (!id_area_fin || !id_partida) {
        return res.status(400).json({
          success: false,
          msg: "Los parámetros id_area_fin e id_partida son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const acceso = await promette.rl_partida_area.findOne({
        where: {
          id_area_infra: parseInt(id_area_fin),
          id_partida: parseInt(id_partida),
        },
        include: [
          {
            model: promette.ct_partida,
            as: "id_partida_ct_partida",
            attributes: ["clave_partida", "nombre_partida"],
          },
          {
            model: promette.rl_area_financiero,
            as: "id_area_infra_rl_area_financiero",
            include: [
              {
                model: promette.rl_area_financiero,
                as: "id_area_infra_rl_area_financiero",
                attributes: [
                  "id_area_fin",
                  "id_financiero",
                  "id_area_infra",
                  "nombre_area",
                ],
              },
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        msg: "Verificación de acceso completada",
        data: {
          tiene_acceso: !!acceso,
          relacion: acceso,
        },
      });
    } catch (error: any) {
      console.error("Error al verificar acceso a partida:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Cambiar estado de una relación partida-área (soft delete)
   */
  static async cambiarEstadoRelacion(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_partida_area } = req.params;
      const { ct_usuario_at } = req.body;

      if (!id_partida_area) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la relación partida-área es requerido",
        });
      }

      if (!ct_usuario_at) {
        return res.status(400).json({
          success: false,
          msg: "El campo ct_usuario_at es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const relacion = await promette.rl_partida_area.findByPk(id_partida_area);

      if (!relacion) {
        return res.status(404).json({
          success: false,
          msg: "La relación partida-área no existe",
        });
      }

      // Actualizar quien realizó la eliminación y eliminar físicamente
      await relacion.update({ ct_usuario_at: parseInt(ct_usuario_at) });
      await relacion.destroy();

      return res.status(200).json({
        success: true,
        msg: "Relación partida-área eliminada exitosamente",
      });
    } catch (error: any) {
      console.error("Error al cambiar estado de relación:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener partidas disponibles para un área específica
   * Solo incluye partidas que no están en rl_partida_area o que coinciden con id_area_infra
   * 
   */
  static async obtenerPartidasDisponibles(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área financiera es requerido",
        });
      }
      /*
      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Obtener el área financiera para verificar su id_area_infra
      const areaFinanciera = await promette.rl_area_financiero.findByPk(parseInt(id_area_fin));
      
      if (!areaFinanciera) {
        return res.status(404).json({
          success: false,
          msg: "Área financiera no encontrada",
        });
      }

      // Obtener todas las partidas que están en rl_partida_area
      const partidasAsignadas = await promette.rl_partida_area.findAll({
        attributes: ['id_partida'],
        raw: true
      });

      const idsPartidasAsignadas = partidasAsignadas.map((pa: any) => pa.id_partida);
      */

      // Obtener las partidas que coinciden con id_area_infra
      const partidasAsignadas = await promette.rl_partida_area.findAll({
        where: {
          id_area_infra: id_area_fin
        },
        attributes: ['id_partida'],
        raw: true
      });

      const idsPartidasAsignadas = partidasAsignadas.map((pc: any) => pc.id_partida);
      console.log(idsPartidasAsignadas);

      // Obtener todas las partidas activas
      const partidasDisponibles = await promette.ct_partida.findAll({
        where: {
          estado: 1,
          id_partida: { [Op.notIn]: idsPartidasAsignadas },
        },
        order: [['clave_partida', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        msg: "Partidas disponibles obtenidas exitosamente",
        partidas: partidasDisponibles,
        total: partidasDisponibles.length,
      });
    } catch (error: any) {
      console.error("Error al obtener partidas disponibles:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}
