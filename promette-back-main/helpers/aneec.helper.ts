import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

console.log('UPLOAD_BASE_PATH:', process.env.UPLOAD_BASE_PATH);

// Configuración de Multer con almacenamiento en memoria
export const configureMulterAneec = (uploadBasePath: string) => {
  const storage = multer.memoryStorage();

  return multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
    
      cb(null, true);
    }
  });
};

// Función para guardar los archivos después de la validación
export const saveFiles = async (files: { [fieldname: string]: Express.Multer.File[] }, uploadBasePath: string) => {
  const savedFiles: { [fieldname: string]: Express.Multer.File[] } = {};

  for (const [fieldname, fileArray] of Object.entries(files)) {
    savedFiles[fieldname] = [];
    
    for (const file of fileArray) {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadBasePath, uniqueName);
      
      // Guardar el archivo en disco
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Crear un objeto similar al que Multer crea con diskStorage
      savedFiles[fieldname].push({
        ...file,
        filename: uniqueName,
        path: filePath
      });
    }
  }

  return savedFiles;
};

// Función genérica para definir campos de Multer
export const defineMulterFields = (fields: { name: string; maxCount: number }[]) => fields;

export const applicantFields = () => [
  { name: 'ruta_ine', maxCount: 1 },
  { name: 'ruta_comprobante_estudio', maxCount: 1 },
  { name: 'ruta_comprobante_domicilio_facilitador', maxCount: 1 },
  { name: 'ruta_comprobante_domicilio_diagnosticado', maxCount: 2 },
  { name: 'ruta_carta_compromiso', maxCount: 1 },
  { name: 'ruta_aviso_privacidad_aspirante', maxCount: 1 },
  { name: 'ruta_diagnostico', maxCount: 2 },
  { name: 'ruta_INE_tutor', maxCount: 2 },
  { name: 'ruta_acta_nacimiento_usuario', maxCount: 2 },
  { name: 'ruta_privacidad_usuario', maxCount: 2 },
  { name: 'ruta_carta_compromiso_usuario', maxCount: 2 },
  { name: 'diagnosticos', maxCount: 1 }
];

// Nueva función para manejar la subida de archivos de informe
export const configureMulterInforme = (uploadBasePath: string) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = path.join(uploadBasePath, 'InformesAneec');
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'informe-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
      }
      cb(null, true);
    }
  });
};

// Nueva función para manejar la subida de archivos de correspondencia
export const configureMulterCorrespondencia = (uploadBasePath: string) => {
  const correspondenciaFolder = path.join(uploadBasePath, 'correspondenciaFile');

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Crear la carpeta si no existe
      if (!fs.existsSync(correspondenciaFolder)) {
        fs.mkdirSync(correspondenciaFolder, { recursive: true });
      }
      cb(null, correspondenciaFolder);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'correspondencia-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
      }
      cb(null, true);
    }
  });
};

// Nueva función para manejar la subida de archivos de planeación
export const configureMulterPlaneacion = (uploadBasePath: string) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = path.join(uploadBasePath, 'PlaneacionesAneec');
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'planeacion-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
      }
      cb(null, true);
    }
  });
};







