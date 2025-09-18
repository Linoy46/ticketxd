import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { dt_funcion } from "../../models/modelsPromette/dt_funcion";



//Esta función retorna todas mis funciones
export const getAllFunctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar los funciones con paginación usando Sequelize
    const functions = await promette.dt_funcion.findAndCountAll({
      where: { estado: 1, id_funcion: { [Op.ne]: 0 } },
    });

    // Verificar si se encontraron funciones
    if (functions.count === 0) {
      res.status(404).json({ msg: "No se encontraron funciones" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      functions: functions.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  const { id_module } = req.params;
  console.log(id_module);
  if (isNaN(Number(id_module))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    // Consultar los funciones con paginación usando Sequelize
    const functions = await promette.dt_funcion.findAll({
      where: { estado: 1, ct_modulo_id: id_module },
    });

    // Verificar si se encontraron funciones

    // Verificar si se encontraron funciones, sino no regresa error y manda el arreglo vacio
    if (functions.length === 0) {
      return res.status(200).json({});
    }
    // Verifica si la longitud está vacio, y si sí manda error (En esta ocación no quiero que lo devuelva como error)
    //if (functions.length === 0) {
    //  return res.status(404).json({
    //    msg: "No se encontraron acciones",
    //  });
    //}
    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      functions, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getFunctionById = async (req: Request, res: Response) => {
  const { id_funcion } = req.params;

  if (isNaN(Number(id_funcion))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const functions = await promette.dt_funcion.findByPk(id_funcion);
    if (functions) {
      res.status(200).json({
        msg: "success",
        functions,
      });
    }
    if (!functions.estado) {
      res.status(400).json({
        msg: "Funcion no vigente",
      });
    }
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion",
    });
  }
};

export const registerFunction = async (req: Request, res: Response) => {
  const { ct_modulo_id, nombre_funcion, descripcion, ct_usuario_in } = req.body;

  try {
    const [newFunction, created] = await promette.dt_funcion.findOrCreate({
      where: { nombre_funcion },
      defaults: {
        ct_modulo_id,
        nombre_funcion,
        descripcion,
        ct_usuario_in,
      },
    });

    if (!created) {
      res.status(400).json({
        msg: "La función ya existe",
      });
    }
    res.status(201).json({
      msg: "El función se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updateFunction = async (req: Request, res: Response) => {
  const {
    id_funcion,
    nombre_funcion,
    descripcion,
    ct_modulo_id,
    ct_usuario_in,
    estado,
  } = req.body;

  try {
    const existUpdateValues = await promette.dt_funcion.findOne({
      where: { nombre_funcion, id_funcion: { [Op.ne]: id_funcion } },
    });

    if (existUpdateValues) {
      res.status(400).json({
        msg: "El nombre de la funcion ya existe",
      });
    }

    //Actualizar
    const currentFunction = await promette.dt_funcion.update(
      {
        nombre_funcion,
        descripcion,
        ct_modulo_id,
        ct_usuario_in,
        estado,
      },
      {
        where: {
          id_funcion,
        },
      }
    );

    if (!currentFunction) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta la funcion actualizada
    res.status(200).json({
      msg: "success",
      currentFunction,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};

export const deleteFuncion = async (req: Request, res: Response) => {
  const {
    id_funcion,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentFunction = await promette.dt_funcion.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_funcion,
        },
      }
    );

    if (!currentFunction) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentFunction,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};