import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Sequelize, Op } from "sequelize";



/**
 * Obtiene los formatos de entrega procesados para el historial
 * - Agrega información necesaria como departamento_nombre, cantidad y usuario_nombre
 * - Filtra según parámetros opcionales
 */
export const getHistorialFormatos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const { fechaInicio, fechaFin, departamento, usuario } = req.query;

    // Construir condiciones para la consulta
    const whereConditions: any = {};

    // Filtrado por fecha
    if (fechaInicio && fechaFin) {
      whereConditions.createdAt = {
        [Op.between]: [
          new Date(fechaInicio as string),
          new Date(fechaFin as string),
        ],
      };
    } else if (fechaInicio) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(fechaInicio as string),
      };
    } else if (fechaFin) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(fechaFin as string),
      };
    }

    // Filtro por usuario
    if (usuario) {
      whereConditions.ct_usuario_id = usuario;
    }

    // Eliminamos la consulta SQL directa y la reemplazamos por otra estrategia

    // Primero hacemos una consulta para obtener todos los departamentos asociados a formatos
    // Esta consulta usa las relaciones definidas en Sequelize en lugar de SQL directo
    const entregasConDepartamento =
      await promette.dt_consumible_entrega.findAll({
        attributes: [
          "folio_formato",
          [Sequelize.fn("MAX", Sequelize.col("ct_area_id")), "ct_area_id"],
        ],
        include: [
          // ct_area se consulta desde API externa - solo guardamos el ID
        ],
        where: {
          folio_formato: {
            [Op.not]: null,
          },
        },
        group: ["folio_formato", "ct_area_id"],
        raw: true,
      });

    // Crear un mapa de folio_formato -> departamento
    const departamentosPorFormato = new Map();

    entregasConDepartamento.forEach((entrega: any) => {
      if (entrega.folio_formato && entrega.ct_area_id) {
        departamentosPorFormato.set(entrega.folio_formato, {
          id: entrega.ct_area_id,
          nombre: `Área ID: ${entrega.ct_area_id}`, // El frontend resolverá el nombre
        });
      }
    });

    console.log(
      `Departamentos encontrados para ${departamentosPorFormato.size} formatos`
    );

    // Buscar todos los formatos con sus relaciones
    const formatos = await promette.rl_entrega_formato.findAll({
      where: whereConditions,
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["id_usuario", "nombre_usuario"],
          required: false,
        },
        {
          model: promette.dt_consumible_entrega,
          as: "dt_consumible_entregas",
          attributes: [
            "id_entrega",
            "folio",
            "ct_area_id",
            "dt_inventario_id",
            "ct_unidad_id",
            "cantidad",
            "ct_usuario_id",
            "observaciones",
            "createdAt",
            "updatedAt",
            "folio_formato",
          ],
          include: [
            {
              model: promette.dt_consumible_inventario,
              as: "dt_inventario",
            },
            // ct_area se consulta desde API externa - solo guardamos el ID
            {
              model: promette.ct_unidad_medida,
              as: "ct_unidad",
              attributes: ["id_unidad", "clave_unidad", "nombre_unidad"],
              required: false,
            },
          ],
          // Filtro por departamento (si se especificó)
          ...(!departamento
            ? {}
            : {
                where: {
                  ct_area_id: departamento,
                },
              }),
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!formatos || formatos.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron formatos de entrega registrados",
        formatos: [],
      });
    }

    // Procesar y transformar los formatos para incluir la información necesaria
    const formatosEnriquecidos = formatos
      .map((formato: any) => {
        try {
          // Convertir a objeto plano para manipularlo
          const formatoPlano = formato.get({ plain: true });

          // Inicializar valores por defecto
          let cantidadTotal = 0;
          let departamento_nombre = "No especificado";
          let departamento_id = null;

          // Obtener el usuario que creó el formato
          const usuario_nombre =
            formatoPlano.ct_usuario?.nombre_usuario || "No especificado";

          // Obtener el departamento del mapa que creamos
          const depInfo = departamentosPorFormato.get(
            formatoPlano.folio_formato
          );
          if (depInfo) {
            departamento_id = depInfo.id;
            departamento_nombre = depInfo.nombre;
          }

          // Si no encontramos el departamento en el mapa, intentar obtenerlo de las entregas
          if (
            !departamento_id &&
            formatoPlano.dt_consumible_entregas &&
            formatoPlano.dt_consumible_entregas.length > 0
          ) {
            // Procesar entregas para obtener cantidad total y departamento
            // Sumar cantidades de todas las entregas
            cantidadTotal = formatoPlano.dt_consumible_entregas.reduce(
              (sum: number, entrega: any) =>
                sum + Number(entrega.cantidad || 0),
              0
            );

            // Obtener el área de la primera entrega que lo tenga
            for (const entrega of formatoPlano.dt_consumible_entregas) {
              if (entrega.ct_area_id) {
                departamento_nombre = `Área ID: ${entrega.ct_area_id}`; // El frontend resolverá el nombre
                departamento_id = entrega.ct_area_id;
                break; // Una vez encontrado, salimos del ciclo
              }
            }
          }

          // Filtrar por departamento si se especificó y no coincide
          if (
            departamento &&
            departamento_id &&
            Number(departamento) !== departamento_id
          ) {
            return null;
          }

          // Construir el objeto con todos los campos necesarios
          return {
            ...formatoPlano,
            cantidadTotal,
            departamento_nombre,
            departamento_id,
            usuario_nombre,
          };
        } catch (error) {
          console.error("Error procesando formato:", error);
          return null;
        }
      })
      .filter(Boolean); // Eliminar posibles elementos null por errores o filtrado

    // Log para depuración
    console.log(`Enviando ${formatosEnriquecidos.length} formatos procesados`);
    if (formatosEnriquecidos.length > 0) {
      console.log("Ejemplo del primer formato:", {
        folio: formatosEnriquecidos[0].folio_formato,
        departamento: formatosEnriquecidos[0].departamento_nombre,
        departamento_id: formatosEnriquecidos[0].departamento_id,
        cantidadTotal: formatosEnriquecidos[0].cantidadTotal,
        usuario: formatosEnriquecidos[0].usuario_nombre,
      });
    }

    return res.status(200).json({
      formatos: formatosEnriquecidos,
    });
  } catch (error) {
    console.error("Error en getHistorialFormatos:", error);
    return res.status(500).json({
      msg: "Error al obtener el historial de formatos de entrega",
      error: error instanceof Error ? error.message : String(error),
      formatos: [],
    });
  }
};
