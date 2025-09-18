import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno
dotenv.config();

export const handleUpload = (
  req: any
): { path: string; replaced: boolean; originalName: string } => {
  if (!req.file) throw new Error("Archivo no recibido");

  // Obtener la URL base configurada en las variables de entorno
  const baseUrl = process.env.API_URL;

  // Construir la ruta relativa al archivo
  // Formato: /uploads/{moduleName}/{documentType}/{id}.{extension}
  const filePath = `/uploads/${req.file.destination.split("uploads/")[1]}/${
    req.file.filename
  }`;

  // Determinar si el archivo reemplazó uno existente
  // Esta propiedad es agregada por nuestro middleware modificado
  const replaced = (req.file as any).replaced || false;

  return {
    path: filePath,
    replaced,
    originalName: req.file.originalname,
  };
};

// Función para generar URL accesible de documentos
export const getDocumentUrl = (relativePath: string): string => {
  if (!relativePath) return "";

  const baseUrl = process.env.API_URL;
  // Si la ruta ya comienza con http, se asume que ya es una URL completa
  if (relativePath.startsWith("http")) {
    return relativePath;
  }

  // Asegurar que la ruta comience con / para rutas relativas
  const normalizedPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;
  return `${baseUrl}${normalizedPath}`;
};
