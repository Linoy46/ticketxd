import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";


// Controlador para obtener todos los usuarios
export const getAllHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los usuarios de la base de datos
    const history = await promette.dt_bitacora.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: promette.ct_accion,
          as: "ct_accion",
          attributes: [
            "nombre_accion",
            "descripcion",
          ],
        },
        {
          model: promette.ct_tabla,
          as: "ct_tabla",
          attributes: [
            "nombre_tabla",
            "descripcion",
          ],
        },
                {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: [
            "nombre_usuario"
          ],
        }
      ]
    });

    if (history.length === 0) {
      return res.status(404).json({
        msg: "No se encontraro bitacora",
      });
    }

    return res.status(200).json({
      history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la bitacora",
    });
  }
};

// Controlador para obtener un usuario por ID
export const getHistoryByUserId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ct_usuario_id } = req.body;

  try {
    const history = await promette.dt_bitacora.findOne({
      where: { ct_usuario_id },
    });

    if (!history) {
      return res.status(404).json({
        msg: "Bitacora no encontrada",
      });
    }

    return res.status(200).json({
      history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener la bitacora",
    });
  }
};

export const registerHistory = async (req: Request, res: Response) => {
  //console.log("Datos recibidos en el controlador:", req.body); // Log para depurar
  const {
    ct_usuario_id,
    ct_accion_id,
    registro_id,
    ct_tabla_id,
    ct_dispositivo_id,
    estatus_accion,
    detalles_error,
  } = req.body;

  // Obtener la IP del cliente
  const ip_origen = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "Desconocida";

  // Validar datos de entrada
  if (
    !ct_usuario_id ||
    !ct_accion_id ||
    !registro_id ||
    !ct_tabla_id ||
    !ip_origen ||
    estatus_accion === undefined // Validar incluso si es 0
  ) {
    return res.status(400).json({
      msg: "Faltan datos requeridos en el cuerpo de la solicitud",
    });
  }

  try {
    // Intentar crear el registro en la base de datos
    const history = await promette.dt_bitacora.create({
      ct_usuario_id,
      ct_accion_id,
      registro_id,
      ct_tabla_id,
      ip_origen,
      ct_dispositivo_id,
      estatus_accion,
      detalles_error,
    });

    res.status(201).json({
      msg: "Bitacora creada exitosamente",
      history,
    });
  } catch (error) {
    console.error("Error en registerHistory:", error);

    // Diferenciar errores de validación y errores internos
    return res.status(500).json({
      msg: "Error interno del servidor",
      //error: error.message, // Solo incluir el mensaje para debug, quitar en producción
    });
  }
};

// export const registerHistory = async (req: Request, res: Response) => {
//   const {
//     ct_usuario_id,
//     ct_accion_id,
//     registro_id,
//     ct_tabla_id,
//     ip_origen,
//     ct_dispositivo_id,
//     estatus_accion,
//     detalles_error,
//   } = req.body;

//   try {
//     const created = await promette.dt_bitacora.Create(
//       ct_usuario_id,
//       ct_accion_id,
//       registro_id,
//       ct_tabla_id,
//       ip_origen,
//       ct_dispositivo_id,
//       estatus_accion,
//       detalles_error
//     );

//     if (!created) {
//       res.status(400).json({
//         msg: "Error al crear",
//       });
//     }
//     res.status(201).json({
//       msg: "Bitacora se ha creado correctamente",
//     });
//   } catch (error) {
//     res.status(422).json({
//       msg: "Error en la petición",
//     });
//   }
// };
