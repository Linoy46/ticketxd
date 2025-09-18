import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";


// Controlador para obtener todos los usuarios
export const getAllPositionModule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los usuarios de la base de datos
    const positionModule = await promette.rl_puesto_modulo.findAll();

    if (positionModule.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron las relaciones",
      });
    }

    return res.status(200).json({
      positionModule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las relaciones",
    });
  }
};

// Controlador para obtener un usuario por ID
export const getPositionModuleById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_puesto_modulo } = req.params;

  try {
    // Buscar un usuario por su ID
    const positionModule = await promette.rl_puesto_modulo.findByPk(
      id_puesto_modulo
    );

    if (!positionModule) {
      return res.status(404).json({
        msg: "Relación no encontrada",
      });
    }

    return res.status(200).json({
      positionModule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el usuario",
    });
  }
};

export const registerPositionModule = async (req: Request, res: Response) => {
  const {
    ct_puesto_id,
    ct_modulo_id,
    func_agregar,
    func_editar,
    func_eliminar,
    func_buscar,
    func_imprimir,
    func_subir,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    const [newPositionModule, created] = await promette.ct_puesto.findOrCreate({
      where: { ct_puesto_id, ct_modulo_id },
      defaults: {
        ct_puesto_id,
        ct_modulo_id,
        func_agregar,
        func_editar,
        func_eliminar,
        func_buscar,
        func_imprimir,
        func_subir,
        ct_usuario_in,
        ct_usuario_at,
      },
    });

    if (!created) {
      res.status(400).json({
        msg: "La relación ya existe",
      });
    }
    res.status(201).json({
      msg: "La relación se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updatePositionModule = async (req: Request, res: Response) => {
  const {
    id_puesto_modulo,
    ct_puesto_id,
    ct_modulo_id,
    func_agregar,
    func_editar,
    func_eliminar,
    func_buscar,
    func_imprimir,
    func_subir,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentSindicate = await promette.ct_tabla.update(
      {
        ct_puesto_id,
        ct_modulo_id,
        func_agregar,
        func_editar,
        func_eliminar,
        func_buscar,
        func_imprimir,
        func_subir,
        ct_usuario_in,
        ct_usuario_at,
      },
      {
        where: {
          id_puesto_modulo,
        },
      }
    );

    if (!currentSindicate) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentSindicate,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};
