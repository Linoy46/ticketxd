import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { ct_usuario } from "../../models/modelsPromette/ct_usuario";



//Esta función retorna todos mis modulos
export const getPermissionsModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { areas } = req.params;
  const arrAreas = areas.split("|");
  try {
    const funciones = await promette.dt_funcion.findAll({
      // where: {
      //   ct_modulo_id: {
      //     [Op.in]: arrAreas, // Aquí usamos Op.in para buscar en un arreglo
      //   },
      // },
      include: [
        {
          model: promette.ct_modulo,
          as: "ct_modulo",
          attributes: ["nombre_modulo", "id_modulo"],
          required: false, // La relación es opcional
          where: {
            estado: 1, // Filtra solo los módulos con estado 1
          },
        },
      ],
      where:{
        estado: 1
      } 
    });



    const groupedByModule = funciones.reduce((acc: any, item: any) => {
      if(item.ct_modulo){
        
        const moduleName = item.ct_modulo.nombre_modulo;
        // Si el módulo ya existe en el acumulador, agregamos la función, si no, creamos un nuevo array con esa función
        if (!acc[moduleName]) {
          acc[moduleName] = [];
        }
        // Agregar la función al arreglo del módulo correspondiente
        acc[moduleName].push({
          label: item.descripcion,
          key: item.id_funcion,
        });
      }
      // Obtener el nombre del módulo
      return acc;
    }, {});

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      modules: groupedByModule, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener modulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

//Esta función retorna todos mis modulos
export const getPermissionsUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ct_usuario_id } = req.params;

  try {
    const permissions = await promette.rl_usuario_funcion.findAll({
      where: {
        ct_usuario_id, // Usuario especificado
      },
    });

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      permissions, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener modulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const savePermissionsUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { permissions } = req.body; // Asegúrate de que 'permissions' esté correctamente escrito en tu solicitud

  try {
    for (let permission of permissions) {
      const existingPermission = await promette.rl_usuario_funcion.findOne({
        where: {
          ct_usuario_id: permission.ct_usuario_id,
          dt_funcion_id: permission.dt_funcion_id,
        },
      });

      if (existingPermission) {
        // Si existe, actualiza la entrada
        await promette.rl_usuario_funcion.update(
          {
            ct_usuario_id: permission.ct_usuario_id,
            dt_funcion_id: permission.dt_funcion_id,
          },
          {
            where: {
              ct_usuario_id: permission.ct_usuario_id,
              dt_funcion_id: permission.dt_funcion_id,
            },
          }
        );
      } else {
        // Si no existe, crea un nuevo permiso
        await promette.rl_usuario_funcion.create({
          ct_usuario_id: permission.ct_usuario_id,
          dt_funcion_id: permission.dt_funcion_id,
        });
      }
    }

    res.status(200).json({ message: "Permisos procesados correctamente" });
  } catch (error) {
    console.error("Error al guardar los permisos:", error);
    res.status(500).json({ message: "Error al guardar los permisos" });
  }
};

//Esta función retorna todos mis modulos
export const getPermissionsPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ct_puesto_id } = req.params;

  try {
    const permissions = await promette.rl_puesto_funcion.findAll({
      where: {
        ct_puesto_id, // Usuario especificado
      },
    });

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      permissions, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener modulos:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const savePermissionsPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { permissions } = req.body; // Asegúrate de que 'permissions' esté correctamente escrito en tu solicitud

  try {
    for (let permission of permissions) {
      const existingPermission = await promette.rl_puesto_funcion.findOne({
        where: {
          ct_puesto_id: permission.ct_puesto_id,
          dt_funcion_id: permission.dt_funcion_id,
        },
      });

      if (existingPermission) {
        // Si existe, actualiza la entrada
        await promette.rl_puesto_funcion.update(
          {
            ct_puesto_id: permission.ct_puesto_id,
            dt_funcion_id: permission.dt_funcion_id,
          },
          {
            where: {
              ct_puesto_id: permission.ct_puesto_id,
              dt_funcion_id: permission.dt_funcion_id,
            },
          }
        );
      } else {
        // Si no existe, crea un nuevo permiso
        await promette.rl_puesto_funcion.create({
          ct_puesto_id: permission.ct_puesto_id,
          dt_funcion_id: permission.dt_funcion_id,
        });
      }
    }

    res.status(200).json({ message: "Permisos procesados correctamente" });
  } catch (error) {
    console.error("Error al guardar los permisos:", error);
    res.status(500).json({ message: "Error al guardar los permisos" });
  }
};

export const removePermissionsUser = async (req: Request, res: Response) => {
  const { permissions } = req.body;

  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      msg: "Faltan parámetros o el formato es incorrecto.",
    });
  }

  try {
    for (const permission of permissions) {
      const { ct_usuario_id, dt_funcion_id } = permission;
      //console.log(`Usuario ID: ${ct_usuario_id}, Función ID: ${dt_funcion_id}`);

      // Elimina los permisos específicos
      const deletedCount = await promette.rl_usuario_funcion.destroy({
        where: {
          ct_usuario_id: ct_usuario_id,
          dt_funcion_id: dt_funcion_id, // Array de IDs de permisos a eliminar
        },
      });
    }

    res.status(200).json({
      msg: "Permiso eliminado exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar permisos:", error);
    res.status(500).json({
      msg: "Error al eliminar permisos.",
    });
  }
};

export const getAllPermisionsByUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_usuario } = req.params;
  try {
    // Obtener todos los usuarios de la base de datos
    const userPosition = await promette.rl_usuario_puesto.findAll({
      attributes: ["ct_puesto_id"],
      where: {
        estado: 1,
        ct_usuario_id: id_usuario,
      },
    });

    const permissionsPosition: any = [];
    for (const puesto of userPosition) {
      const result = await promette.rl_puesto_funcion.findAll({
        where: {
          ct_puesto_id: puesto.dataValues.ct_puesto_id,
        },

        include: [
          {
            model: promette.dt_funcion,
            as: "dt_funcion",
            attributes: ["nombre_funcion"],
            include: [
              {
                model: promette.ct_modulo,
                as: "ct_modulo",
                attributes: ["nombre_modulo"],
              },
            ],
          },
        ],
      });

      if (result[0]) {
        permissionsPosition.push(...result);
      }
    }
    // return res.status(200).json({ userPosition });
    const permissionsUser = await promette.rl_usuario_funcion.findAll({
      where: {
        ct_usuario_id: id_usuario,
      },

      include: [
        {
          model: promette.dt_funcion,
          as: "dt_funcion",
          attributes: ["nombre_funcion"],
          include: [
            {
              model: promette.ct_modulo,
              as: "ct_modulo",
              attributes: ["nombre_modulo"],
            },
          ],
        },
      ],
    });
    const permissionsArray = generatePermissionsArray({
      permissionsPosition,
      permissionsUser,
    });
    return res.status(200).json({
      permissionsArray,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las relaciones",
    });
  }
};

const generatePermissionsArray = (data: any) => {
  // console.log(data.dt_funcion);
  const permissions: any[] = [];

  // Procesar permissionsPosition
  data.permissionsPosition.forEach((permission: any) => {
    const module = permission.dt_funcion.ct_modulo.nombre_modulo;
    const func = permission.dt_funcion.nombre_funcion;
    permissions.push(`${module}:${func}`);
  });

  // Procesar permissionsUser (si hay)
  data.permissionsUser.forEach((permission: any) => {
    const module = permission.dt_funcion.ct_modulo.nombre_modulo;
    const func = permission.dt_funcion.nombre_funcion;
    permissions.push(`${module}:${func}`);
  });
  //console.log(permissions);
  return permissions;
};

export const removePermissionsPosition = async (req: Request, res: Response) => {
  const { permissions } = req.body;
  
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      msg: "Faltan parámetros o el formato es incorrecto.",
    });
  }

  try {

    for (const permission of permissions) {
      const { ct_puesto_id, dt_funcion_id } = permission;
      console.log(`Puesto ID: ${ct_puesto_id}, Función ID: ${dt_funcion_id}`);
    
      // Elimina los permisos específicos
      const deletedCount = await promette.rl_puesto_funcion.destroy({
        where: {
          ct_puesto_id: ct_puesto_id,
          dt_funcion_id: dt_funcion_id, // Array de IDs de permisos a eliminar
        },
      });
    
    }

    res.status(200).json({
      msg: "Permiso eliminado exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar permisos:", error);
    res.status(500).json({
      msg: "Error al eliminar permisos.",
    });
  }
};
