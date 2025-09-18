import { Request, Response, NextFunction } from "express";
import { createMulterConfig } from "../config/multerConfig";
import path from "path";
import fs from "fs";

interface UploadOptions {
  fieldName?: string; // Nombre del campo de formulario (default: 'file')
  // Permite que documentType sea un string o una función que devuelve un string
  documentType?: string | ((req: Request) => string);
  idField?: string; // Campo en req.body o req.params que contiene el ID
}

export const uploadFor = (module: string, options?: UploadOptions) => {
  const fieldName = options?.fieldName || "file";

  return (req: Request, res: Response, next: NextFunction) => {
    // Identificar el ID desde los parámetros o el body
    const id = options?.idField
      ? req.params[options.idField] || req.body[options.idField] || "unknown"
      : "unknown";

    // Determinar la subcarpeta (documento tipo)
    let documentType = "general";
    if (options?.documentType) {
      if (typeof options.documentType === "function") {
        documentType = options.documentType(req);
      } else {
        documentType = options.documentType;
      }
    }

    const useIdAsFilename = module === "salidas" && documentType === "formatos";

    // Crear configuración de multer con los parametros anteriores
    const upload = createMulterConfig(module, {
      subfolder: documentType,
      idSuffix: id,
      keepOriginalName: false,
      forceExtension: useIdAsFilename ? ".pdf" : undefined,
    });

    console.log(
      "Processing upload request with fields:",
      Object.keys(req.body || {})
    );
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Document type:", documentType);
    console.log("ID:", id);

    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          error: true,
          message: err.message || "Error al subir el archivo",
          code: err.code || "UPLOAD_ERROR",
        });
      }

      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({
          error: true,
          message: "No se ha subido ningún archivo",
          code: "NO_FILE",
        });
      }

      // Verificar si se reemplazó algún archivo
      // Nota: Esta comprobación es post-hecho ya que multer ya habrá eliminado
      // el archivo original si existía uno, así que usamos una propiedad para
      // indicar esto en la respuesta
      if (req.file) {
        (req.file as any).replaced = true;
      }

      console.log("File uploaded successfully:", req.file);
      next();
    });
  };
};
