// import { ct_niveles_educativos } from './../../src/models/modelProdep/ct_niveles_educativos';
import { Request, Response, NextFunction } from "express";
import { promette } from '../../models/database.models'; // Importa los modelos
import dotenv from "dotenv";
import { Op } from 'sequelize';

//interfaces
const PDFDocument = require('pdfkit');
import swaggerJSDoc from "swagger-jsdoc";
import { json } from "sequelize";

import { Writable } from 'stream';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { configureMulterInforme } from '../../helpers/aneec.helper';
import { configureMulterPlaneacion } from '../../helpers/aneec.helper';

// Cargar variables de entorno

// Cargar variables de entorno
dotenv.config();

//obtencion de modelos





//verificar si los modelos se pueden usar correctamente
const modelsValidator = async (req: Request, res: Response,) => {
  if (!promette) {
    res.status(500).json({ message: "Error de conexión con la base de datos" });
    return;
  }
}


//METODOS DEL CONTROLADOR//

export const accesoController = async (req: Request, res: Response,) => {

  res.status(200).json({ message: "ACCESO CORRECTO" });

}

// Configura Multer con la ruta base de subida
const uploadBasePath = process.env.UPLOAD_BASE_PATH || './';
const uploadFolderPath = path.join(uploadBasePath, 'fileDiagnostic'); // Ruta completa

// Definir la función configureMulterAneec
const configureMulterAneec = (uploadPath: string) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        // Agregar 'filediagnostic' a la ruta base
        const fullPath = path.join(uploadPath, 'filediagnostic');

        // Crear el directorio si no existe
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'diagnostico-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: function (req, file, cb) {
      // Validar que el archivo sea un PDF
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
      }
      cb(null, true);
    }
  });
};



// Interface para los datos del estudiante
/*interface StudentData {
  nombre: string;
  curp: string;
  necesidadAtender: string;
  especificacion?: string;
  rehabilitacion: 'S' | 'N';
  municipio: number;
  dt_aspirante_id?: number;
}*/

/*
export const registrarDiagnostico = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ message: "Error de conexión con la base de datos" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo." });
    }

    // Verificar si el archivo es un PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: "Solo se permiten archivos PDF" });
    }

    const { 
      nombreCompleto, 
      curp, 
      tipo_necesidad, 
      rehabilitacion_fisica, 
      ct_municipio_id, 
      dt_aspirante_id,
      ruta_diagnostico
    } = req.body;

    // Validar campos obligatorios
    if (!nombreCompleto || !curp || !tipo_necesidad || !rehabilitacion_fisica || !ct_municipio_id || !dt_aspirante_id) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Validar que ct_municipio_id exista en ct_municipio
    const municipio = await promette.ct_municipio.findByPk(ct_municipio_id);
    if (!municipio) {
      return res.status(400).json({ message: "El municipio no existe" });
    }

    // Validar que dt_aspirante_id exista en dt_aspirante_aneec
    const aspirante = await promette.dt_aspirante_aneec.findByPk(dt_aspirante_id);
    if (!aspirante) {
      return res.status(400).json({ message: "El aspirante no existe" });
    }

    // Obtener solo el nombre del archivo (sin la ruta completa)
    let nombreArchivo = '';
    if (req.file) {
      nombreArchivo = req.file.filename; // Usamos filename generado por multer (ej: "diagnostico-123456789.pdf")
    } else if (ruta_diagnostico) {
      nombreArchivo = path.basename(ruta_diagnostico); // Extrae el nombre del archivo si se envía manualmente
    }

    // Crear diagnóstico (guardando solo el nombre del archivo)
    const diagnostico = await promette.dt_diagnostico_aneec.create({
      nombreCompleto,
      curp,
      tipo_necesidad,
      rehabilitacion_fisica,
      ct_municipio_id,
      dt_aspirante_id,
      ruta_diagnostico: nombreArchivo, // Solo el nombre del archivo
      ct_usuario_in: 1, // Asegúrate de que el nombre del campo sea correcto
      fecha_in: new Date()
    });

    return res.status(201).json({
      message: "Diagnóstico registrado exitosamente",
      diagnostico
    });

  } catch (error) {
    console.error("Error detallado:", error);

    // Verificar si el error es una instancia de Error
    if (error instanceof Error) {
      if (error.message === 'La variable de entorno UPLOAD_BASE_PATH no está configurada.') {
        return res.status(500).json({ message: error.message });
      }
      if (error.message === 'Solo se permiten archivos PDF') {
        return res.status(400).json({ message: error.message });
      }
    }

    return res.status(500).json({ 
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};*/




// Configura Multer para el archivo "informe"
const uploadInforme = configureMulterInforme(uploadBasePath);

// Definir la función defineMulterFields
const defineMulterFields = (fields: { name: string, maxCount: number }[]) => {
  return fields;
};

// Define los campos de Multer si es necesario
const fields = defineMulterFields([
  { name: 'diagnostico', maxCount: 1 },
  { name: 'informe', maxCount: 1 }
]);

// Middleware para manejar la subida de archivos
export const uploadDiagnostico = configureMulterAneec(uploadBasePath).single('diagnostico');
export const uploadInformeMiddleware = uploadInforme.single('informe');





// Función para eliminar un archivo subido
const deleteUploadedFile = (file: Express.Multer.File) => {
  if (file && fs.existsSync(file.path)) { // Verificar si el archivo existe
    fs.unlinkSync(file.path); // Eliminar archivo subido
  }
};



export const registrarInforme = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Verificar si se ha subido un archivo
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se ha subido ningún archivo." });
    }

    // Verificar si el archivo es un PDF
    if (req.file.mimetype !== 'application/pdf') {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "Solo se permiten archivos PDF" });
    }

    // Obtener dt_aspirante_id y dt_diagnostico_id del cuerpo de la solicitud
    const { dt_aspirante_id, dt_diagnostico_id } = req.body;

    // Asignar un valor por defecto a ct_usuario_in 
    const ct_usuario_in = 1;

    // Validar que dt_aspirante_id y dt_diagnostico_id estén presentes
    if (!dt_aspirante_id || !dt_diagnostico_id) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "Los campos dt_aspirante_id y dt_diagnostico_id son requeridos" });
    }

    // Validar que dt_aspirante_id exista en dt_aspirante_aneec
    const aspirante = await promette.dt_aspirante_aneec.findByPk(dt_aspirante_id);
    if (!aspirante) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "El aspirante no existe" });
    }

    // Validar que dt_diagnostico_id exista en dt_diagnostico_aneec
    const diagnostico = await promette.dt_diagnostico_aneec.findByPk(dt_diagnostico_id);
    if (!diagnostico) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "El diagnóstico no existe" });
    }

    // Validar que el diagnóstico pertenezca al facilitador (dt_aspirante_id)
    if (diagnostico.dt_aspirante_id !== parseInt(dt_aspirante_id)) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ 
        success: false, 
        message: "El usuario diagnóstico no pertenece al facilitador especificado" 
      });
    }

    // Obtener el primer día del mes actual
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    // Verificar si ya existe un informe para este diagnóstico en el mes actual
    const informeExistente = await promette.dt_informes_aneec.findOne({
      where: {
        dt_diagnostico_id,
        createdAt: {
          [Op.between]: [primerDiaMes, ultimoDiaMes]
        }
      }
    });

    if (informeExistente) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({
        success: false,
        message: "Ya existe un informe para este usuario diagnosticado en el mes actual"
      });
    }

    // Verificar si ya existen 4 informes para esta combinación de facilitador y usuario diagnóstico
    const totalInformes = await promette.dt_informes_aneec.count({
      where: {
        dt_aspirante_id,
        dt_diagnostico_id
      }
    });

    if (totalInformes >= 4) {
      deleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Ya se han subido 4 informes para este usuario diagnóstico. No se pueden subir más."
      });
    }

    // Obtener solo el nombre del archivo (sin la ruta completa)
    const nombreArchivo = req.file.filename;

    // Crear informe (guardando solo el nombre del archivo, el dt_aspirante_id, el ct_usuario_in y el dt_diagnostico_id)
    const informe = await promette.dt_informes_aneec.create({
      ruta_informe: nombreArchivo,
      dt_aspirante_id,
      ct_usuario_in,
      dt_diagnostico_id
    });

    return res.status(201).json({
      success: true,
      message: "Informe registrado exitosamente",
      informe
    });

  } catch (error) {
    console.error("Error detallado:", error);

    // Eliminar el archivo subido en caso de error
    if (req.file) {
      deleteUploadedFile(req.file);
    }

    // Verificar si el error es una instancia de Error
    if (error instanceof Error) {
      if (error.message === 'La variable de entorno UPLOAD_BASE_PATH no está configurada.') {
        return res.status(500).json({ success: false, message: error.message });
      }
      if (error.message === 'Solo se permiten archivos PDF') {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};


// Método para obtener el catálogo de planeaciones de ANEEC con vigencia "S"
export const getPlanningCatalog = async (req: Request, res: Response) => {
  try {
    // Verificar si los modelos están disponibles
    modelsValidator(req, res);

    //Se usa el where para traer solo los documentos vigentes
    const documentosAneec = await promette.ct_documentos_aneec.findAll({
      where: {
        vigencia: 'S'
      }
    });

    // Devolver los registros encontrados
    res.status(200).json({ success: true, message: 'Catálogo de documentos obtenido correctamente', documentosAneec });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el catálogo de documentos ANEEC", error: error instanceof Error ? error.message : String(error) });
  }
};






/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_BASE_PATH || './filediagnostic';
    
    // Crear el directorio si no existe y si UPLOAD_BASE_PATH no está definido
    if (!process.env.UPLOAD_BASE_PATH && !fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'diagnostico-' + uniqueSuffix + path.extname(file.originalname));
  }
});*/

/*

export const obtenerDiagnosticos = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Obtener todos los diagnósticos de la tabla dt_diagnostico_aneec con un join a dt_aspirante_aneec
    const diagnosticos = await promette.dt_diagnostico_aneec.findAll({
      include: [{
        model: promette.dt_aspirante_aneec,
        as: 'dt_aspirante', // Cambia 'aspirante' por 'dt_aspirante' para que coincida con el alias definido en la asociación
        attributes: ['nombre', 'apellido_paterno', 'apellido_materno'] // Seleccionar los campos del aspirante
      }]
    });

    return res.status(200).json({
      success: true,
      message: "Diagnósticos obtenidos exitosamente",
      diagnosticos
    });

  } catch (error) {
    console.error("Error detallado:", error);

    return res.status(500).json({ 
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};*/





// Método para obtener todos los informes asociados a un facilitador
export const obtenerInformesPorAspiranteId = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Obtener dt_aspirante_id de los parámetros de la solicitud
    const { dt_aspirante_id } = req.params;

    // Validar que dt_aspirante_id esté presente
    if (!dt_aspirante_id) {
      return res.status(400).json({ success: false, message: "El campo dt_aspirante_id es requerido" });
    }

    // Buscar todos los informes asociados al dt_aspirante_id con un join a dt_diagnostico_aneec
    const informes = await promette.dt_informes_aneec.findAll({
      where: { dt_aspirante_id },
      include: [{
        model: promette.dt_diagnostico_aneec,
        as: 'dt_diagnostico',
        attributes: ['nombreCompleto']
      }]
    });

    // Verificar si se encontraron informes
    if (!informes || informes.length === 0) {
      return res.status(404).json({ success: false, message: "No se encontraron informes para el aspirante especificado" });
    }

    return res.status(200).json({
      success: true,
      message: "Informes obtenidos exitosamente",
      informes
    });

  } catch (error) {
    console.error("Error detallado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
}




// Middleware para manejar la subida de archivos de planeación
export const uploadPlaneacion = configureMulterPlaneacion(process.env.UPLOAD_BASE_PATH || './');
export const uploadPlaneacionMiddleware = uploadPlaneacion.single('planeacion');

export const guardarPlaneacion = async (req: Request, res: Response) => {
  try {
    // Verificar si la variable de entorno UPLOAD_BASE_PATH está definida
    if (!process.env.UPLOAD_BASE_PATH) {
      return res.status(500).json({ 
        success: false, 
        message: "La variable de entorno UPLOAD_BASE_PATH no está configurada." 
      });
    }

    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Verificar si se ha subido un archivo
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se ha subido ningún archivo." });
    }

    // Verificar si el archivo es un PDF
    if (req.file.mimetype !== 'application/pdf') {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "Solo se permiten archivos PDF" });
    }

    // Obtener los datos del cuerpo de la solicitud
    const { id_tipo_documento, dt_aspirante_id, dt_diagnostico_id } = req.body;

    // Asignar un valor por defecto a ct_usuario_in 
    const ct_usuario_in = 1;

    // Validar que los campos requeridos estén presentes
    if (!id_tipo_documento || !dt_aspirante_id || !dt_diagnostico_id) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "Los campos id_tipo_documento, dt_aspirante_id y dt_diagnostico_id son requeridos" });
    }

    // Validar que id_tipo_documento exista en ct_documentos_aneec
    const tipoDocumento = await promette.ct_documentos_aneec.findByPk(id_tipo_documento);
    if (!tipoDocumento) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "El tipo de documento no existe" });
    }

    // Validar que dt_aspirante_id exista en dt_aspirante_aneec
    const aspirante = await promette.dt_aspirante_aneec.findByPk(dt_aspirante_id);
    if (!aspirante) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "El aspirante no existe" });
    }

    // Validar que dt_diagnostico_id exista en dt_diagnostico_aneec
    const diagnostico = await promette.dt_diagnostico_aneec.findByPk(dt_diagnostico_id);
    if (!diagnostico) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ success: false, message: "El diagnóstico no existe" });
    }

    // Validar que el diagnóstico pertenezca al facilitador (dt_aspirante_id)
    if (diagnostico.dt_aspirante_id !== parseInt(dt_aspirante_id)) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({ 
        success: false, 
        message: "El usuario diagnóstico no pertenece al facilitador especificado" 
      });
    }

    // Obtener el primer día del mes actual
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    // Verificar si ya existe una planeación para este diagnóstico en el mes actual
    const planeacionExistente = await promette.dt_planeaciones_aneec.findOne({
      where: {
        dt_diagnostico_id,
        createdAt: {
          [Op.between]: [primerDiaMes, ultimoDiaMes]
        }
      }
    });

    if (planeacionExistente) {
      deleteUploadedFile(req.file); // Eliminar el archivo subido
      return res.status(400).json({
        success: false,
        message: "Ya existe una planeación para este diagnóstico en el mes actual"
      });
    }

    // Verificar si ya existen 4 planeaciones para esta combinación de facilitador y usuario diagnóstico
    const totalPlaneaciones = await promette.dt_planeaciones_aneec.count({
      where: {
        dt_aspirante_id,
        dt_diagnostico_id
      }
    });

    if (totalPlaneaciones >= 4) {
      deleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Ya se han subido 4 planeaciones para este usuario diagnóstico. No se pueden subir más."
      });
    }

    // Obtener solo el nombre del archivo (sin la ruta completa)
    const nombreArchivo = req.file.filename;

    // Crear la planeación (guardando solo el nombre del archivo y los IDs relacionados)
    const planeacion = await promette.dt_planeaciones_aneec.create({
      ruta_documento: nombreArchivo,
      id_tipo_documento,
      dt_aspirante_id,
      dt_diagnostico_id,
      ct_usuario_in
    });

    return res.status(201).json({
      success: true,
      message: "Planeación registrada exitosamente",
      planeacion
    });

  } catch (error) {
    console.error("Error detallado:", error);

    // Eliminar el archivo subido en caso de error
    if (req.file) {
      deleteUploadedFile(req.file);
    }

    // Verificar si el error es una instancia de Error
    if (error instanceof Error) {
      if (error.message === 'La variable de entorno UPLOAD_BASE_PATH no está configurada.') {
        return res.status(500).json({ success: false, message: error.message });
      }
      if (error.message === 'Solo se permiten archivos PDF') {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }


  
};




// Método para obtener todas las planeaciones asociadas a un aspirante
export const obtenerPlaneacionesPorAspiranteId = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Obtener dt_aspirante_id de los parámetros de la solicitud
    const { dt_aspirante_id } = req.params;

    // Validar que dt_aspirante_id esté presente
    if (!dt_aspirante_id) {
      return res.status(400).json({ success: false, message: "El campo dt_aspirante_id es requerido" });
    }

    // Buscar todas las planeaciones asociadas al dt_aspirante_id con un join a dt_diagnostico_aneec y ct_documentos_aneec
    const planeaciones = await promette.dt_planeaciones_aneec.findAll({
      where: { dt_aspirante_id },
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico',
          attributes: ['nombreCompleto']
        },
        {
          model: promette.ct_documentos_aneec,
          as: 'id_tipo_documento_ct_documentos_aneec',
          attributes: ['id_tipo_documento', 'nombre'] 
        }
      ]
    });

    // Verificar si se encontraron planeaciones
    if (!planeaciones || planeaciones.length === 0) {
      return res.status(404).json({ success: false, message: "No se encontraron planeaciones para el aspirante especificado" });
    }

    return res.status(200).json({
      success: true,
      message: "Planeaciones obtenidas exitosamente",
      planeaciones
    });

  } catch (error) {
    console.error("Error detallado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};



