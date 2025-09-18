import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { initModels } from "../models/modelsPromette/init-models";
import { sequelize } from "../config/database";
import { promette } from "../models/database.models";



// Definición del middleware `validateJwt` mejorado
const validateJwt = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición",
    });
  }

  try {
    // Verifica el token y extrae el id del payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JwtPayload;

    // Comprobamos si el token está expirado
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        msg: "Token expirado",
      });
    }

    // Verificamos si los modelos están inicializados
    if (!promette) {
      return res.status(500).json({
        msg: "Modelos no inicializados",
      });
    }

    // Busca al usuario en la base de datos usando el id del token
    const user = await promette.ct_usuario.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        msg: "Token no válido - usuario no encontrado",
      });
    }

    // Verificamos si el usuario está activo
    if (!user.estado) {
      return res.status(401).json({
        msg: "Token no válido - usuario inactivo",
      });
    }

    // Asignamos el usuario al objeto `req` para el acceso posterior
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        msg: "Token expirado",
      });
    }
    return res.status(401).json({
      msg: "Token no válido",
    });
  }
};

export { validateJwt };
