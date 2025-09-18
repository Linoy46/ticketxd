import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

interface FileNamingOptions {
  subfolder?: string; // Tipo de documento o subcarpeta
  idSuffix?: string; // ID para nombrar el archivo
  keepOriginalName?: boolean; // Si mantiene el nombre original
  forceExtension?: string; // Forzar una extensión específica
}

export function createMulterConfig(
  moduleName: string,
  options?: FileNamingOptions
) {
  // Obtener la ruta base de almacenamiento desde variables de entorno o usar una por defecto
  const baseStoragePath =
    process.env.UPLOADS_PATH || path.join(__dirname, "..", "uploads");

  // Construir la ruta completa
  let uploadPath = path.join(baseStoragePath, moduleName);

  // Si hay una subcarpeta especificada, añadirla a la ruta
  if (options?.subfolder) {
    uploadPath = path.join(uploadPath, options.subfolder);
  }

  // Crear la estructura de directorios si no existe
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      // Usar la extensión especificada o la del archivo original
      const extname =
        options?.forceExtension ||
        path.extname(file.originalname).toLowerCase();

      let fileName = "";

      // Si se debe mantener el nombre original (sin extensión)
      if (options?.keepOriginalName) {
        const base = path.basename(file.originalname, extname);
        fileName = base;
      } else {
        // Si no, usar simplemente el ID como nombre
        fileName = options?.idSuffix || Date.now().toString();
      }

      // Asegurarse de que la extensión tenga el punto inicial
      const finalExtension = extname.startsWith(".") ? extname : `.${extname}`;

      // Añadir extensión manteniendo el formato correcto según el tipo
      fileName += finalExtension;
      // Verificar si existe un archivo con el mismo nombre y eliminarlo
      const filePath = path.join(uploadPath, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath); // Eliminar el archivo existente
          console.log(`Archivo existente eliminado: ${filePath}`);
        } catch (error) {
          console.error(
            `Error al eliminar archivo existente ${filePath}:`,
            error
          );
        }
      }
      cb(null, fileName);
    },
  });

  // Filtro para aceptar PDFs e imagenes
  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const extname = path.extname(file.originalname).toLowerCase();
    // Lista de tipos MIME permitidos
    const allowedMimes = [
      "application/pdf", // PDF
      "image/jpeg", // JPEG, JPG
      "image/png", // PNG
    ];
    // Lista de extensiones permitidas
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    if (
      allowedMimes.includes(file.mimetype) &&
      allowedExtensions.includes(extname)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Solo se permiten archivos PDF (.pdf) e imágenes (.jpg, .jpeg, .png)"
        )
      );
    }
  };
  // Limite de tamano para el archivo
  const limits = {
    fileSize: 5 * 1024 * 1024, // MAXIMO 5MB
  };
  return multer({
    storage,
    fileFilter,
    limits,
  });
}
