import { Request, Response } from "express";
import crypto from "crypto-js";
import bcrypt from "bcryptjs";
import { promette } from '../../models/database.models';

import {
  generateToken,
  verifyToken,
  decodeToken,
} from "../../helpers/token.helper";
import { sendEmail } from "../../helpers/send.email.helper";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";




export const getAllPermisionsByUser = async (id_usuario : number) => {
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
    return permissionsArray;
  } catch (error) {
    return "Error al obtener las relaciones";
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

export const register = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    contrasena,
    telefono,
    curp,
    email,
    email_institucional,
    portal_name = "PROMETTE", // Valores por defecto para compatibilidad
    email_template = "wellcomeRegister.html",
    email_subject = "Bienvenido a PROMETTE"
  } = req.body;

  try {
    // Asegúrate de que los modelos estén inicializados
    if (!promette) {
      return res.status(500).json({ msg: "Modelos no inicializados" });
    }

    // Usamos findOrCreate para intentar encontrar un usuario con el mismo nombre_usuario, email, email_institucional o curp.
    let [user, created] = await promette.ct_usuario.findOrCreate({
      where: {
        [Op.or]: [{ nombre_usuario }, { email }, { curp }],
      },
      defaults: {
        nombre_usuario,
        telefono,
        curp,
        contrasena: bcrypt.hashSync(contrasena, 10), // Hasheamos la contraseña
        email,
        email_institucional,
        estado: 1,
        ct_usuario_in: 1,
      },
    });

    // Si el usuario no fue creado (es decir, ya existía en la base de datos), retornamos un mensaje de error
    if (!created) {
      return res.status(400).json({
        msg: "El nombre de usuario, email, email institucional o CURP ya están registrados",
      });
    }
    const htmlFilePath = path.join(
      __dirname,
      "..",
      "..",
      "mails",
      email_template
    );
    // Leemos el archivo HTML para el correo
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    const linkHost = `${process.env.HOST_FRONT}auth/login`;

    // Reemplazamos los marcadores de posición en el HTML
    htmlContent = htmlContent
      .replace("{{nombre_usuario}}", nombre_usuario)
      .replace("{{portal_name}}", portal_name)
      .replace("{{portal_name}}", portal_name)
      .replace("{{link_login}}", linkHost)
      .replace("{{link_login}}", linkHost)
      .replace("{{link_login}}", linkHost)
      .replace("{{nombre_usuario}}", nombre_usuario)
      .replace("{{contrasena}}", contrasena)

    // Enviar el correo electrónico con el enlace de restablecimiento
    sendEmail(
      process.env.EMAIL_ADDRESS || "",
      process.env.EMAIL_PASSWORD || "",
      email,
      htmlContent,
      email_subject
    );

    // Si todo está correcto, respondemos con el usuario creado
    res.status(200).json({ user, msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

export const validateField = async (req: Request, res: Response) => {
  const { field, value } = req.body; // Recibimos el campo y su valor a través de la query string

  try {
    if (!promette) {
      return res.status(500).json({ msg: "Modelos no inicializados" });
    }

    let userExists = false;

    switch (field) {
      case "nombre_usuario":
        userExists = await promette.ct_usuario.findOne({
          where: { nombre_usuario: value },
        });
        break;
      case "email":
        userExists = await promette.ct_usuario.findOne({
          where: { email: value },
        });
        break;
      case "curp":
        userExists = await promette.ct_usuario.findOne({
          where: { curp: value },
        });
        break;
      default:
        return res.status(400).json({ msg: "Campo no válido" });
    }

    if (userExists) {
      return res.status(200).json({ msg: "Campo en uso" });
    } else {
      return res.status(200).json({ msg: "Campo disponible" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Controlador para iniciar sesión
export const login = async (req: Request, res: Response) => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // Asegúrate de que los modelos estén inicializados antes de usarlos
    if (!promette) {
      return res.status(500).json({ msg: "Modelos no inicializados" });
    }

    // Busca al usuario por nombre de usuario
    const user = await promette.ct_usuario.findOne({
      where: { nombre_usuario }
    }, 
    {
      include:[
        {
          model: promette.rl_usuario_puesto,
          as: "rl_usuario_puestos",
          attributes: ["ct_puesto_id"],
          where: { estado: 1 },
          include: [
            {
              model: promette.ct_puesto,
              as: 'ct_puesto',
              attributes: ['ct_area_id'],
            }
          ]
        },
      ]
    });
    if (!user) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }
    if (!user.estado) {
      return res.status(400).json({ msg: "Usuario bloqueado" });
    }



    // // Compara la contraseña ingresada con la almacenada
    // const validPassword = bcrypt.compareSync(contrasena, user.contrasena);
    // if (!validPassword) {
    //   return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    // }


    let passwordMatches = false;

    if (user.contrasena.startsWith("$2a$") || user.contrasena.startsWith("$2b$")) {
      // Si la contraseña ya está en bcrypt, la comparamos con bcrypt
      passwordMatches = bcrypt.compareSync(contrasena, user.contrasena);
    } else {
      // Si está en MD5, comparamos con MD5
      const hashedMD5 = crypto.MD5(contrasena).toString();
      passwordMatches = hashedMD5 === user.contrasena;

      if (passwordMatches) {
        // Si la contraseña en MD5 es correcta, la migramos a bcrypt
        const hashedBcrypt = bcrypt.hashSync(contrasena, 10);
        await promette.ct_usuario.update(
          { contrasena: hashedBcrypt },
          { where: { id_usuario: user.id_usuario } }
        );
        console.log("Contraseña migrada a bcrypt con éxito.");
      }
    }

    if (!passwordMatches) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }


    // Genera un token para el usuario
    const token = generateToken(user.id_usuario); // Usamos el helper para generar el token

    // Calcula los permisos para el usuario
    const permissions = await getAllPermisionsByUser(user.id_usuario);

    res.json({ token, user, permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Controlador para renovar token
export const renewToken = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "No hay token en la petición" });
  }

  try {
    let decoded: any;
    try {
      // Verifica el token
      decoded = verifyToken(token); // Usamos el helper para verificar el token
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "Token no válido o expirado"
      ) {
        // Si el token está expirado, decodifícalo
        decoded = decodeToken(token); // Usamos el helper para decodificar el token si está expirado
      } else {
        throw error;
      }
    }

    const { id }: any = decoded;
    const user = await promette.ct_usuario.findByPk(id, {
      include:[
        {
          model: promette.rl_usuario_puesto,
          as: "rl_usuario_puestos",
          attributes: ["ct_puesto_id"],
          where: { estado: 1 },
          include: [
            {
              model: promette.ct_puesto,
              as: 'ct_puesto',
              attributes: ['ct_area_id'],
            }
          ]
        },
      ]
    });
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Genera un nuevo token para el usuario
    const newToken = generateToken(user.id_usuario); // Usamos el helper para generar el nuevo token

    // Calcula los permisos para el usuario
    const permissions = await getAllPermisionsByUser(user.id_usuario);

    res.json({ token: newToken, user, permissions });
  } catch (error: unknown) {
    console.error(error);
    res.status(401).json({ msg: "Token no válido", error });
  }
};

// Controlador para verificar si el usuario está logueado
export const isLoggin = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No hay token en la petición" });
  }

  try {
    const decoded: any = verifyToken(token);
    const user = await promette.ct_usuario.findByPk(decoded.id, {
      include: [
        {
          model: promette.rl_usuario_puesto,
          as: "rl_usuario_puestos",
          attributes: ["ct_puesto_id"],
          where: { estado: 1 },
          required: false, 
          include: [
            {
              model: promette.ct_puesto,
              as: "ct_puesto",
              attributes: ["ct_area_id"],
            },
          ],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const permissions = await getAllPermisionsByUser(user.id_usuario);

    res.json({ user, permissions });
  } catch (error: unknown) {
    console.error(error);
    res.status(401).json({ msg: "Token no válido", error });
  }
};

// Controlador para verificar si el usuario está logueado
export const isAuthorization = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(404).json({ msg: "No hay token en la petición" });
  }

  try {
    // Verifica el token de autenticación
    const decoded: any = verifyToken(token); // Usamos el helper para verificar el token
    const user = await promette.ct_usuario.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    if (!user.estado) {
      return res.status(404).json({ msg: "Usuario bloqueado" });
    }

    return res.status(200).json({});
  } catch (error: unknown) {
    console.error(error);
    return res.status(404).json({ msg: "Token no válido", error });
  }
};

// Controlador para recuperar la contraseña
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Verifica que los modelos estén inicializados
    if (!promette) {
      return res.status(500).json({ msg: "Modelos no inicializados" });
    }

    // Busca al usuario por email
    const user = await promette.ct_usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: "Correo electrónico no encontrado" });
    }

    // Genera un token para la recuperación de contraseña
    const resetToken = generateToken(user.id_usuario, "1m"); // Este token se usará para validar la solicitud

    // Crea un enlace para restablecer la contraseña
    const resetLink = `${process.env.HOST_FRONT}auth/restorePassword/${resetToken}`;
    const htmlFilePath = path.join(
      __dirname,
      "..",
      "..",
      "mails",
      "restorePassword.html"
    );
    // Leemos el archivo HTML para el correo
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    // Reemplazamos el marcador de posición en el HTML con el enlace de recuperación
    htmlContent = htmlContent.replace("{{resetLink}}", resetLink);
    // Enviar el correo electrónico con el enlace de restablecimiento
    sendEmail(
      process.env.EMAIL_ADDRESS || "",
      process.env.EMAIL_PASSWORD || "",
      email,
      htmlContent
    );

    res.json({
      msg: "Se ha enviado un enlace para recuperar la contraseña al correo electrónico proporcionado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Controlador para restablecer la contraseña
export const resetPassword = async (req: Request, res: Response) => {
  const { token, contrasena } = req.body;

  try {
    // Verifica el token de recuperación
    const decoded: any = verifyToken(token); // Verifica el token de recuperación

    const user = await promette.ct_usuario.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Hashea la nueva contraseña
    const hashedPassword = bcrypt.hashSync(contrasena, 10);

    // Actualiza la contraseña del usuario
    await promette.ct_usuario.update(
      { contrasena: hashedPassword },
      { where: { id_usuario: user.id_usuario } }
    );

    // Crea un enlace para restablecer la contraseña
    const linkLogin = `${process.env.HOST_FRONT}auth/login/`;
    const htmlFilePath = path.join(
      __dirname,
      "..",
      "..",
      "mails",
      "restoreSuccess.html"
    );
    // Leemos el archivo HTML para el correo
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    // Reemplazamos el marcador de posición en el HTML con el enlace de recuperación
    htmlContent = htmlContent
      .replace("{{nombre_usuario}}", user.nombre_usuario)
      .replace("{{contrasena}}", contrasena)
      .replace("{{email}}", user.email)
      .replace("{{emailText}}", user.email)
      .replace("{{linkLogin}}", linkLogin)
      .replace("{{linkLoginButton}}", linkLogin);
    // Enviar el correo electrónico con el enlace de restablecimiento
    sendEmail(
      process.env.EMAIL_ADDRESS || "",
      process.env.EMAIL_PASSWORD || "",
      user.email,
      htmlContent
    );

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};
