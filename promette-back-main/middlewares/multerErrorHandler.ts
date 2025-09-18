import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ 
        success: false, 
        message: "Campo de archivo no esperado. Asegúrate de que el campo se llame correctamente." 
      });
    }
    if (err.code === "ENOENT") {
      return res.status(500).json({ success: false, message: "El directorio de destino no está disponible" });
    }
    return res.status(500).json({ success: false, message: "Error al subir los archivos" });
  }
  next();
};

export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ 
        success: false, 
        message: "Campo de archivo no esperado. Asegúrate de que el campo se llame correctamente." 
      });
    }
    if (err.code === "ENOENT") {
      return res.status(500).json({ success: false, message: "El directorio de destino no está disponible" });
    }
    return res.status(500).json({ success: false, message: "Error al subir los archivos" });
  }
  next();
};

export const validateUploadPath = (subFolder: string) => {
  return (req: Request, res: Response, next: NextFunction) => {

    // Recarga de las variables de entorno
    const envConfig = dotenv.config();
    if (envConfig.error) {
      console.error("Error al cargar .env:", envConfig.error);
      return res.status(500).json({ success: false, message: "Error en las variables de entorno" });
    }

    // Obtener la ruta base desde las variables de entorno
    const uploadBasePath = process.env.UPLOAD_BASE_PATH || "";
    const fullPath = path.join(uploadBasePath, subFolder);

    // Verificar si la ruta base existe
    if (!fs.existsSync(uploadBasePath)) {
      return res.status(500).json({ success: false, message: "La ruta base no está disponible" });
    }

    // Verificar si la subcarpeta existe, si no, crearla
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    next(); // Continuar con el siguiente middleware o ruta
  };
};