import { Request, Response } from "express";
import { promette } from "../../models/database.models";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

// Controlador para obtener todos los usuarios
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id_usuario } = req.params;

    const areas = await promette.rl_usuario_puesto.findAll({
      where: { ct_usuario_id: id_usuario },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["ct_area_id"],
        },
      ],
    });
    // Obtener todos los usuarios de la base de datos
    const users = await promette.ct_usuario.findAll({
      where: { estado: 1, id_usuario: { [Op.ne]: 0 } },
    });

    if (users.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron usuarios",
      });
    }

    return res.status(200).json({
      users,
      areas,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los usuarios",
    });
  }
};

// Controlador para obtener un usuario por ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_usuario } = req.params;

  try {
    // Buscar un usuario por su ID
    const user = await promette.ct_usuario.findByPk(id_usuario);

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el usuario",
    });
  }
};

// Controlador para obtener un usuario por ID
export const getUserByCurp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { curp } = req.params;

  try {
    const userPromette = await promette.ct_usuario.findOne({
      where: { curp },
      attributes: { exclude: ["contrasena"] },
    });
    if (!userPromette) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      userPromette,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el usuario",
    });
  }
};

//Eliminar para usar funcion del auth.contoller.ts
export const registerUser = async (req: Request, res: Response) => {
  const {
    id_usuario,
    nombre_usuario,
    contrasena,
    telefono,
    email,
    email_institucional,
    curp,
    estado,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    const [newUser, created] = await promette.ct_usuario.findOrCreate({
      where: { curp, nombre_usuario, email, email_institucional },
      defaults: {
        id_usuario,
        nombre_usuario,
        contrasena,
        telefono,
        email,
        email_institucional,
        curp,
        estado,
        ct_usuario_in,
        ct_usuario_at,
      },
    });

    if (!created) {
      res.status(400).json({
        msg: "El usuario ya existe",
      });
    }
    res.status(201).json({
      msg: "El usuario se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};

export const updateUserOutside = async (req: Request, res: Response) => {
  const {
    id_usuario,
    nombre_usuario,
    email,
    curp,
    telefono_personal,
    ct_usuario_in,
  } = req.body;
  // Actualizar el usuario en la tabla ct_usuario
  const usuarioActualizado = await promette.ct_usuario.update(
    {
      nombre_usuario,
      curp,
      telefono: telefono_personal,
      email,
      ct_usuario_at: ct_usuario_in,
    },
    { where: { id_usuario } }
  );

  if (!usuarioActualizado) {
    res.status(400).json({
      msg: "Error al actualizar",
    });
  }
  res.status(200).json({
    msg: "El usuario se ha actualizado correctamente",
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const {
    id_usuario,
    nombre_usuario,
    contrasena,
    telefono,
    email,
    email_institucional,
    curp,
    estado,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  const existUpdateValues = await promette.ct_usuario.findOne({
    where: { curp, id_usuario: { [Op.ne]: id_usuario } },
  });

  if (existUpdateValues) {
    res.status(400).json({
      msg: "El nombre de la tabla ya existe",
    });
  }

  try {
    //Actualizar
    const currentSindicate = await promette.ct_usuario.update(
      {
        nombre_usuario,
        contrasena,
        telefono,
        email,
        email_institucional,
        curp,
        estado,
        ct_usuario_in,
        ct_usuario_at,
      },
      {
        where: {
          id_usuario,
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

// Controlador para actualizar contraseña del usuario
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_usuario; // Del token JWT
    const { newPassword } = req.body;

    // Validar que la nueva contraseña existe
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña es requerida",
      });
    }

    // Validar longitud de la contraseña
    if (newPassword.length < 6 || newPassword.length > 18) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener entre 6 y 18 caracteres",
      });
    }

    // Validar que solo contenga letras y números
    const alphanumericPattern = /^[a-zA-Z0-9]*$/;
    if (!alphanumericPattern.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña solo puede contener letras y números",
      });
    }

    // Obtener el usuario actual
    const user = await promette.ct_usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Encriptar la nueva contraseña con bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña en la base de datos
    await promette.ct_usuario.update(
      { contrasena: hashedPassword },
      { where: { id_usuario: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const hashAndUpdatePasswords = async () => {
  try {
    // Obtener todos los usuarios
    const users = await promette.ct_usuario.findAll();
    let i = 0;
    for (const user of users) {
      i++;
      const { id_usuario, contrasena } = user;

      // Verificar si la contraseña ya está encriptada (asumimos que todas las encriptadas tienen 60 caracteres)
      if (!contrasena || contrasena.length === 60) continue;

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      // Actualizar la contraseña en la base de datos
      await promette.ct_usuario.update(
        { contrasena: hashedPassword },
        { where: { id_usuario } }
      );

      console.log(`Numero: ${i}`);
    }

    console.log("Proceso de actualización de contraseñas finalizado.");
  } catch (error) {
    console.error("Error al actualizar las contraseñas:", error);
  }
};

export const generateCurp = async (req: Request, res: Response) => {
  const { nombres, primerApellido, fechaNacimiento, sexo, paisOrigen } =
    req.body;

  try {
    // Algoritmo para generar CURP para extranjeros
    let curp = "";

    // Primeras letras del apellido
    curp += primerApellido.substring(0, 2).toUpperCase();

    // Primera letra del nombre
    curp += nombres.charAt(0).toUpperCase();

    // Fecha de nacimiento
    const fecha = new Date(fechaNacimiento);
    curp += fecha.getFullYear().toString().substring(2);
    curp += (fecha.getMonth() + 1).toString().padStart(2, "0");
    curp += fecha.getDate().toString().padStart(2, "0");

    // Sexo
    curp += sexo;

    // Código del país
    curp += "NE"; // NE para "Nacido en el Extranjero"

    // Consonantes y números aleatorios
    curp += "X" + Math.random().toString(36).substring(2, 4).toUpperCase();

    // Dígitos aleatorios
    curp += Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");

    return res.status(200).json({
      curp,
      message: "CURP generada exitosamente",
    });
  } catch (error) {
    console.error("Error al generar CURP:", error);
    return res.status(500).json({
      message: "Error al generar CURP",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id_usuario, ct_usuario_at } = req.body;

  try {
    //Actualizar
    const currentUser = await promette.ct_usuario.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_usuario,
        },
      }
    );

    if (!currentUser) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentUser,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};
