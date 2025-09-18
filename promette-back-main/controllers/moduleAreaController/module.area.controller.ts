import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { ct_modulo } from '../../models/modelsPromette/ct_modulo';



//Esta función retorna todas mis funciones
export const getAllModulesArea = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar los funciones con paginación usando Sequelize
    const modules = await promette.ct_modulo.findAll({
      attributes: ["id_modulo", "nombre_modulo"],
      where: { estado: 1, id_modulo: { [Op.ne]: 0 } },
    });

    // Verificar si se encontraron funciones
    if (modules.count === 0) {
      res.status(404).json({ msg: "No se encontraron módulos" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      modules: modules.rows, // Registros de la página solicitada
    });
    console.log(modules)
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

// Controlador para obtener todos los usuarios
export const getAllModulesByArea = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area } = req.params;
  try {
    // Obtener todos los usuarios de la base de datos
    const moduleArea = await promette.rl_modulo_area.findAll({
      attributes: ["id_modulo_area", "ct_area_id", "ct_modulo_id"],
      include: [
        {
          model: promette.ct_modulo,
          as: "ct_modulo",
          attributes: ["nombre_modulo"], // Solo traer el campo `nombre_modulo`
        },
      ],
      where: {
        ct_area_id: id_area, // Filtrar registros donde `ct_area_id` sea igual al valor de `id_area`
      },
    });

    if (moduleArea.length === 0) {
      return res.status(200).json({
        msg: "No se encontraron las relaciones",
      });
    }

    return res.status(200).json({
      moduleArea,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las relaciones",
    });
  }
};


export const registerModuleArea = async (req: Request, res: Response) => {
  const {
    ct_area_id,
    ct_modulo_id,
  } = req.body;

  try {
    const [newModuleArea, created] = await promette.rl_modulo_area.findOrCreate({
      where: { ct_area_id, ct_modulo_id },
      defaults: {
        ct_area_id,
        ct_modulo_id,
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

export const deleteModuleArea = async (req: Request, res: Response) => {
  const {
    id_modulo_area,
    ct_usuario_at,
  } = req.body;
  try {
    //Actualizar
    const currentModuleArea = await promette.rl_modulo_area.destroy(
      {
        where: {
          id_modulo_area,
        },
      }
    );

    if (!currentModuleArea) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentModuleArea,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};