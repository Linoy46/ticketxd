import { Request, Response } from "express";
import { promette } from '../../models/database.models';



export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const count = await promette.ct_departamento_sistema.count({
      where: { estado: 1 },
    });

    if (count === 0) {
      return res.status(404).json({ msg: "No se encontraron departamentos" });
    }

    const departments = await promette.ct_departamento_sistema.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_direccion_sistema,
          as: "ct_direccion",
          attributes: ["nombre_direccion"],
        },
      ],
    });

    res.status(200).json({
      msg: "success",
      departments,
    });
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  const { id_departamento } = req.params;

  if (isNaN(Number(id_departamento))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const department = await promette.ct_departamento_sistema.findByPk(id_departamento, {
      include: [
        {
          model: promette.ct_direccion_sistema,
          as: "ct_direccion", // Asegúrate de que el alias coincida con la relación definida en el modelo
          attributes: ["nombre_direccion"],
        },
      ],
    }
    );

    if (!department) {
      return res.status(404).json({ msg: "Departamento no encontrado" });
    }

    if (!department.estado) {
      return res.status(400).json({ msg: "Departamento no vigente" });
    }

    res.status(200).json({
      msg: "success",
      department,
    });
  } catch (error) {
    console.error("Error al obtener el departamento:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const registerDepartment = async (req: Request, res: Response) => {
  const { nombre_departamento, ct_direccion_id, ct_usuario_in } = req.body;

  if (!nombre_departamento || !ct_direccion_id || !ct_usuario_in) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    const department = await promette.ct_departamento_sistema.create({
      nombre_departamento,
      ct_direccion_id,
      ct_usuario_in,
      estado: 1,
    });

    res.status(201).json({
      msg: "Departamento creado exitosamente",
      department,
    });
  } catch (error) {
    console.error("Error al crear el departamento:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id_departamento, nombre_departamento, ct_direccion_id, estado, ct_usuario_at } =
    req.body;

  if (isNaN(Number(id_departamento))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const department = await promette.ct_departamento_sistema.findByPk(
      id_departamento
    );

    if (!department) {
      return res.status(404).json({ msg: "Departamento no encontrado" });
    }

    await department.update({
      nombre_departamento,
      ct_direccion_id,
      estado,
      ct_usuario_at,
    });

    res.status(200).json({
      msg: "Departamento actualizado exitosamente",
      department,
    });
  } catch (error) {
    console.error("Error al actualizar el departamento:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const {
    id_departamento,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentDepartment = await promette.ct_departamento_sistema.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_departamento,
        },
      }
    );

    if (!currentDepartment) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentDepartment,
    });
  } catch (error) {

    console.log(error)
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};