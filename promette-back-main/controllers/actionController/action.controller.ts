import { Request, Response } from "express";
import { promette } from '../../models/database.models';



//Retorna todas las acciones
export const getAllActions = async (req: Request, res: Response) => {
  try {
    const actions = await promette.ct_accion.findAll();
    if (actions.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron acciones",
      });
    }
    res.status(200).json({
      msg: "success",
      actions,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener las acciones",
    });
  }
};

export const getActionById = async (req: Request, res: Response) => {
  try {
    const action = await promette.ct_accion.findByPk(req.body.id_accion);
    if (!action) {
      return res.status(404).json({
        msg: "Acción no encontrada",
      });
    }
    res.status(200).json({
      msg: "success",
      action,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener la acción",
    });
  }
};

export const createAction = async (req: Request, res: Response) => {
  try {
    const { nombre_accion, descripcion } = req.body;
    const action = await promette.ct_accion.create({
      nombre_accion,
      descripcion,
    });
    res.status(201).json({
      msg: "Acción creada correctamente",
      action,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear la acción",
    });
  }
};

export const updateAction = async (req: Request, res: Response) => {
  try {
    const { id_accion, nombre_accion, descripcion } = req.body;

    const action = await promette.ct_accion.findByPk(id_accion);
    if (!action) {
      return res.status(404).json({
        msg: "Acción no encontrada",
      });
    }

    await action.update({
      nombre_accion,
      descripcion,
    });

    //Respues de que se actualizo la accion
    res.status(200).json({
      msg: "Acción actualizada correctamente",
      action,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar la acción",
    });
  }
};
