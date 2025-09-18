import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { ct_modulo } from "../../models/modelsPromette/ct_modulo";



//Esta función retorna todos mis modulos
export const getAllModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar los módulos con paginación usando Sequelize
    const modules = await promette.ct_modulo.findAndCountAll({
      where: { estado: 1, id_modulo: { [Op.ne]: 0 } },
    });

    // Verificar si se encontraron módulos
    if (modules.count === 0) {
      res.status(404).json({ msg: "No se encontraron Módulos" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      modules: modules.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener modulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  const { id_modulo } = req.params;

  if (isNaN(Number(id_modulo))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const module = await promette.ct_modulo.findByPk(id_modulo);

    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }

    res.status(200).json({
      msg: "success",
      module,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const registerModule = async (req: Request, res: Response) => {
  const {
    nombre_modulo,
    ct_modulo_padre_id,
    //url_modulo,
    //icono,
    //orden_modulo,
    ct_usuario_in,
  } = req.body;

  if (!nombre_modulo || !ct_usuario_in) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const module = await promette.ct_modulo.create({
      nombre_modulo,
      ct_modulo_padre_id,
      //url_modulo,
      //icono,
      //orden_modulo,
      ct_usuario_in,
    });

    res.status(201).json({
      msg: "Module created successfully",
      module,
    });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateModule = async (req: Request, res: Response) => {


  const {
    id_modulo,
    nombre_modulo,
    ct_modulo_padre_id,
    //url_modulo,
    //icono,
    //orden_modulo,
    estado,
    ct_usuario_at,
  } = req.body;

  if (isNaN(Number(id_modulo))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const module = await promette.ct_modulo.findByPk(id_modulo);

    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }

    await module.update({
      nombre_modulo,
      ct_modulo_padre_id,
      //url_modulo,
      //icono,
      //orden_modulo,
      estado,
      ct_usuario_at,
    });

    res.status(200).json({
      msg: "Module updated successfully",
      module,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

//Esta función retorna todos mis modulos
export const getAllPrimaryModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar los módulos con paginación usando Sequelize
    const modules = await promette.ct_modulo.findAndCountAll({
      where: { estado: 1, modulo_padre: 0 },
    });

    // Verificar si se encontraron módulos
    if (modules.count === 0) {
      res.status(404).json({ msg: "No se encontraron Módulos" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      modules: modules.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener modulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  const {
    id_modulo,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentModule = await promette.ct_modulo.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_modulo,
        },
      }
    );

    if (!currentModule) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentModule,
    });
  } catch (error) {

    console.log(error)
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};