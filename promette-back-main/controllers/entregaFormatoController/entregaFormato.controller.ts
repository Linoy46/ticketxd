import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { z } from "zod";



/**
 * Esquema para validar la creación de formatos de entrega
 */
const EntregaFormatoSchema = z.object({
  mes_cantidad: z.string().max(100).nullish(),
  persona_recibe: z.string().max(255).nullish(),
  ct_usuario_id: z.number().int().positive(),
  entregas_ids: z.array(z.number().int().positive()).optional(),
});
type EntregaFormatoInput = z.infer<typeof EntregaFormatoSchema>;

/**
 * Genera un folio único para formatos de entrega
 */
const generateFormatoFolio = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `FORMAT-${year}${month}-`;

  // Buscar el último folio con el prefijo actual
  const lastFormato = await promette.rl_entrega_formato.findOne({
    where: {
      folio_formato: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["folio_formato", "DESC"]],
  });

  let counter = 1;

  if (lastFormato) {
    // Extraer el número del último folio
    const lastNumber = parseInt(
      lastFormato.folio_formato.replace(prefix, ""),
      10
    );
    if (!isNaN(lastNumber)) {
      counter = lastNumber + 1;
    }
  }

  // Crear el nuevo folio
  return `${prefix}${counter.toString().padStart(3, "0")}`;
};

// Controlador para crear un nuevo formato de entrega
export const createFormato = async (req: Request, res: Response) => {
  try {
    const { mes_cantidad, persona_recibe, ct_usuario_id, entregas_ids } =
      req.body;

    if (!ct_usuario_id) {
      return res.status(400).json({
        success: false,
        msg: "El ID de usuario es requerido",
      });
    }

    // Verificar que el usuario existe antes de relacionarlo
    const usuario = await promette.ct_usuario.findByPk(ct_usuario_id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        msg: "El usuario especificado no existe",
      });
    }

    // Generar un nuevo folio para el formato
    const folio_formato = await generateFormatoFolio();

    // Crear el formato de entrega
    const formato = await promette.rl_entrega_formato.create({
      folio_formato,
      mes_cantidad,
      persona_recibe,
      ct_usuario_id,
    });

    // Si se proporcionan IDs de entregas, asociarlas al formato
    if (
      entregas_ids &&
      Array.isArray(entregas_ids) &&
      entregas_ids.length > 0
    ) {
      await promette.dt_consumible_entrega.update(
        {
          folio_formato,
        },
        {
          where: {
            id_entrega: {
              [Op.in]: entregas_ids,
            },
          },
        }
      );
    }

    // Obtener el formato recién creado con relaciones para devolverlo en la respuesta
    const formatoCreado = await promette.rl_entrega_formato.findByPk(
      formato.id_formato,
      {
        include: [
          {
            model: promette.ct_usuario,
            as: "ct_usuario",
          },
        ],
      }
    );

    return res.status(201).json({
      success: true,
      msg: "Formato de entrega creado correctamente",
      formato: formatoCreado,
    });
  } catch (error) {
    console.error("Error al crear formato de entrega:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al crear el formato de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para obtener todos los formatos de entrega
export const getAllFormatos = async (req: Request, res: Response) => {
  try {
    const formatos = await promette.rl_entrega_formato.findAll({
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
        },
        {
          model: promette.dt_consumible_entrega,
          as: "dt_consumible_entrega",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ formatos });
  } catch (error) {
    console.error("Error al obtener formatos de entrega:", error);
    return res.status(500).json({
      msg: "Error al obtener los formatos de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para obtener un formato por ID
export const getFormatoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const formato = await promette.rl_entrega_formato.findByPk(id, {
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
        },
        {
          model: promette.dt_consumible_entrega,
          as: "dt_consumible_entrega",
          include: [
            {
              model: promette.dt_consumible_inventario,
              as: "dt_inventario",
            },
            {
              model: promette.ct_consumible_departamento,
              as: "ct_departamento",
            },
          ],
        },
      ],
    });

    if (!formato) {
      return res.status(404).json({
        msg: "Formato de entrega no encontrado",
      });
    }

    return res.status(200).json({ formato });
  } catch (error) {
    console.error("Error al obtener formato de entrega:", error);
    return res.status(500).json({
      msg: "Error al obtener el formato de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para actualizar un formato
export const updateFormato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = EntregaFormatoSchema.parse(req.body);
    const { mes_cantidad, persona_recibe, ct_usuario_id, entregas_ids } = data;

    // Verificar que el formato existe
    const formato = await promette.rl_entrega_formato.findByPk(id);
    if (!formato) {
      return res.status(404).json({
        msg: "Formato de entrega no encontrado",
      });
    }

    // Actualizar el formato
    await promette.rl_entrega_formato.update(
      {
        mes_cantidad,
        persona_recibe,
        ct_usuario_id,
      },
      {
        where: { id_formato: id },
      }
    );

    // Manejar las asociaciones de entregas si existen
    if (entregas_ids && entregas_ids.length > 0) {
      // Primero, desasociar todas las entregas actuales
      await promette.dt_consumible_entrega.update(
        { folio_formato: null },
        {
          where: { folio_formato: formato.folio_formato },
        }
      );

      // Luego, asociar las nuevas entregas
      await promette.dt_consumible_entrega.update(
        { folio_formato: formato.folio_formato },
        {
          where: {
            id_entrega: {
              [Op.in]: entregas_ids,
            },
          },
        }
      );
    }

    // Obtener el formato actualizado con sus relaciones
    const formatoActualizado = await promette.rl_entrega_formato.findByPk(id, {
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
        },
        {
          model: promette.dt_consumible_entrega,
          as: "dt_consumible_entrega",
          // No incluimos relaciones anidadas para evitar errores
        },
      ],
    });

    return res.status(200).json({
      msg: "Formato de entrega actualizado correctamente",
      formato: formatoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar formato de entrega:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      msg: "Error al actualizar el formato de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para eliminar un formato
export const deleteFormato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el formato existe
    const formato = await promette.rl_entrega_formato.findByPk(id);
    if (!formato) {
      return res.status(404).json({
        msg: "Formato de entrega no encontrado",
      });
    }

    // Primero, desasociar todas las entregas relacionadas
    await promette.dt_consumible_entrega.update(
      { folio_formato: null },
      {
        where: { folio_formato: formato.folio_formato },
      }
    );

    // Luego, eliminar el formato
    await promette.rl_entrega_formato.destroy({
      where: { id_formato: id },
    });

    return res.status(200).json({
      msg: "Formato de entrega eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar formato de entrega:", error);
    return res.status(500).json({
      msg: "Error al eliminar el formato de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para asociar entregas a un formato existente
export const associateEntregasToFormato = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { entregas_ids } = req.body;

    // Verificar que el formato existe
    const formato = await promette.rl_entrega_formato.findByPk(id);
    if (!formato) {
      return res.status(404).json({
        msg: "Formato de entrega no encontrado",
      });
    }

    if (entregas_ids && entregas_ids.length > 0) {
      // Asociar las nuevas entregas
      await promette.dt_consumible_entrega.update(
        { folio_formato: formato.folio_formato },
        {
          where: {
            id_entrega: {
              [Op.in]: entregas_ids,
            },
          },
        }
      );
    }

    return res.status(200).json({
      msg: "Entregas asociadas al formato correctamente",
    });
  } catch (error) {
    console.error("Error al asociar entregas al formato:", error);
    return res.status(500).json({
      msg: "Error al asociar entregas al formato",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Método para obtener todos los formatos con sus relaciones completas
export const getAllFormatosEntrega = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const formatos = await promette.rl_entrega_formato.findAll({
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["id_usuario", "nombre_usuario"],
          required: false,
        },
        {
          model: promette.dt_consumible_entrega,
          as: "dt_consumible_entrega",
          include: [
            {
              model: promette.ct_consumible_departamento,
              as: "ct_departamento",
              attributes: ["id_departamento", "nombre_departamento"],
              required: false,
            },
            {
              model: promette.ct_unidad_medida,
              as: "ct_unidad",
              attributes: ["id_unidad", "clave_unidad", "nombre_unidad"],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (formatos.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron formatos de entrega registrados",
        formatos: [],
      });
    }

    // Procesar los formatos para agregar información adicional simplificada
    const formatosConInfo = formatos.map((formato: any) => {
      const formatoObj = formato.get({ plain: true });

      // Inicializar valores por defecto
      let departamento_nombre = "No especificado";
      let usuario_nombre =
        formatoObj.ct_usuario?.nombre_usuario || "No especificado";
      let cantidadTotal = 0;

      // Procesar entregas asociadas para obtener cantidad total y departamento
      if (
        formatoObj.dt_consumible_entrega &&
        formatoObj.dt_consumible_entrega.length > 0
      ) {
        // Sumar cantidades
        cantidadTotal = formatoObj.dt_consumible_entrega.reduce(
          (sum: number, entrega: any) => sum + Number(entrega.cantidad || 0),
          0
        );

        // Buscar el primer departamento válido
        for (const entrega of formatoObj.dt_consumible_entrega) {
          if (
            entrega.ct_departamento &&
            entrega.ct_departamento.nombre_departamento
          ) {
            departamento_nombre = entrega.ct_departamento.nombre_departamento;
            break;
          }
        }
      }

      // Añadir los campos calculados al objeto directamente
      formatoObj.cantidadTotal = cantidadTotal;
      formatoObj.departamento_nombre = departamento_nombre;
      formatoObj.usuario_nombre = usuario_nombre;

      return formatoObj;
    });

    return res.status(200).json({
      formatos: formatosConInfo,
    });
  } catch (error) {
    console.error("Error en getAllFormatosEntrega:", error);
    return res.status(500).json({
      msg: "Error al obtener los formatos de entrega",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
