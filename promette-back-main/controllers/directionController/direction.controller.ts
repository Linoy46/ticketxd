import { Request, Response } from "express";
import { promette } from '../../models/database.models';



export const getAllDirections = async (req: Request, res: Response) => {
  try {
    const count = await promette.ct_direccion_sistema.count({
      where: { estado: 1 },
    });

    if (count === 0) {
      return res.status(404).json({ msg: "No directions found" });
    }

    const directions = await promette.ct_direccion_sistema.findAll({
      where: { estado: 1 },
    });

    res.status(200).json({
      msg: "success",
      directions,
    });
  } catch (error) {
    console.error("Error fetching directions:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getDirectionById = async (req: Request, res: Response) => {
  const { id_direccion } = req.params;

  if (isNaN(Number(id_direccion))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const direction = await promette.ct_direccion_sistema.findByPk(id_direccion
    );

    if (!direction) {
      return res.status(404).json({ msg: "Direction not found" });
    }

    if (!direction.estado) {
      return res.status(400).json({ msg: "Direction not active" });
    }

    res.status(200).json({
      msg: "success",
      direction,
    });
  } catch (error) {
    console.error("Error fetching direction:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const registerDirection = async (req: Request, res: Response) => {
  const { nombre_direccion, ct_dependencia_id, ct_usuario_in } = req.body;

  if (!nombre_direccion || !ct_dependencia_id || !ct_usuario_in) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const direction = await promette.ct_direccion_sistema.create({
      nombre_direccion,
      ct_dependencia_id,
      ct_usuario_in,
      estado: 1,
    });

    res.status(201).json({
      msg: "Direction created successfully",
      direction,
    });
  } catch (error) {
    console.error("Error creating direction:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateDirection = async (req: Request, res: Response) => {
  const { id_direccion } = req.params;
  const { nombre_direccion, ct_dependencia_id, estado, ct_usuario_at } =
    req.body;

  if (isNaN(Number(id_direccion))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const direction = await promette.ct_direccion_sistema.findByPk(
      id_direccion
    );

    if (!direction) {
      return res.status(404).json({ msg: "Direction not found" });
    }

    await direction.update({
      nombre_direccion,
      ct_dependencia_id,
      estado,
      ct_usuario_at,
    });

    res.status(200).json({
      msg: "Direction updated successfully",
      direction,
    });
  } catch (error) {
    console.error("Error updating direction:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteDirection = async (req: Request, res: Response) => {
  const {
    id_direccion,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentDirection = await promette.ct_direccion_sistema.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_direccion,
        },
      }
    );

    if (!currentDirection) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentDirection,
    });
  } catch (error) {

    console.log(error)
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};