import { Request, Response, NextFunction } from "express";
import { getModels } from "../../models/modelsPromette"; // Importa los modelos
import dotenv from "dotenv";
import { Op } from "sequelize"; // Importar Op directamente
import axios from "axios";
import { Router } from 'express';
import { PuestoAreaHelper } from "../../helpers/puestoarea.helper";

//interfaces
interface RequestWithUser extends Request {
  user?: {
    id_usuario: number;
    [key: string]: any;
  };
}

const PDFDocument = require("pdfkit");
import swaggerJSDoc from "swagger-jsdoc";
import { json } from "sequelize";

import { Writable } from "stream";
import multer from "multer";
import path from "path";
import fs from "fs";


// Cargar variables de entorno
dotenv.config();

//obtencion de modelos

let promette: any;
getModels(process.env.DBNAMES || "")
  .then((models) => {
    promette = models;
  })
  .catch((error) => {
    console.error("Error al inicializar los modelos:", error);
  });

//verificar si los modelos se pueden usar correctamente
const modelsValidator = async (req: Request, res: Response) => {
  if (!promette) {
    res.status(500).json({ message: "Error de conexión con la base de datos" });
    return;
  }
};

// Configuración de multer para la carga de archivos
const configureMulterCorrespondencia = (uploadBasePath: string) => {
  if (!uploadBasePath) {
    console.warn('Advertencia: La variable de entorno UPLOAD_BASE_PATH no está definida. No se creará la carpeta para archivos.');
    return null;
  }

  const correspondenciaFolder = path.join(
    uploadBasePath,
    "correspondenciaFile"
  );

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(correspondenciaFolder)) {
        fs.mkdirSync(correspondenciaFolder, { recursive: true });
      }
      cb(null, correspondenciaFolder);
    },
    filename: function (req, file, cb) {
      // Usar un nombre temporal
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "temp-" + uniqueSuffix + ".pdf");
    },
  });

  return multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Solo se permiten archivos PDF"));
      }
      cb(null, true);
    },
  });
};

// Inicializar multer con la ruta base
const upload = configureMulterCorrespondencia(
  process.env.UPLOAD_BASE_PATH || ""
);
// Función para obtener los estados de correspondencia
export const obtenerEstadosCorrespondencia = async (
  req: Request,
  res: Response
) => {
  try {
    if (!promette) {
      return res
        .status(500)
        .json({ message: "Error de conexión con la base de datos" });
    }

    const estadosCorrespondencia =
      await promette.ct_correspondencia_estado.findAll({
        attributes: ['id_correspondencia_estado', 'nombre_estado']
      });
    
    res.status(200).json({ success: true, data: estadosCorrespondencia });
  } catch (error) {
    console.error("Error al obtener los estados de correspondencia:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los estados de correspondencia",
    });
  }
};

// Función para obtener las formas de entrega
export const obtenerFormasEntrega = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res
        .status(500)
        .json({ message: "Error de conexión con la base de datos" });
    }

    const formasEntrega = await promette.ct_forma_entrega.findAll();
    res.status(200).json({ success: true, data: formasEntrega });
  } catch (error) {
    console.error("Error al obtener las formas de entrega:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las formas de entrega",
    });
  }
};

// Función para obtener las clasificaciones de prioridad
export const obtenerClasificacionesPrioridad = async (
  req: Request,
  res: Response
) => {
  try {
    if (!promette) {
      return res
        .status(500)
        .json({ message: "Error de conexión con la base de datos" });
    }

    const clasificacionesPrioridad =
      await promette.ct_clasificacion_prioridad.findAll();
    res.status(200).json({ success: true, data: clasificacionesPrioridad });
  } catch (error) {
    console.error("Error al obtener las clasificaciones de prioridad:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las clasificaciones de prioridad",
    });
  }
};

// Variable para almacenar el valor incremental (puedes usar la base de datos para persistirlo)
let contadorFolio = 0;

function formatearFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  // Forzar hora fija a medio día para evitar desfases
  return `${yyyy}-${mm}-${dd} 12:00:00`;
}

// Función para normalizar acentos
const normalizarAcentos = (texto: string): string => {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Función para insertar datos en dt_correspondencia

export const insertarCorrespondencia = async (req: Request, res: Response) => {
  try {
    // Verificar si el archivo se recibió correctamente
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ningún archivo PDF' });
    }

    // Verificar que el archivo sea un PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Solo se permiten archivos PDF' });
    }

    const {
      id_usuario_puesto,
      id_usuario_puesto_2,
      ct_clasificacion_prioridad_id,
      ct_forma_entrega_id,
      folio_correspondencia,
      resumen_correspondencia,
      ct_usuarios_in,
      fecha_correspondencia,
    } = req.body;

    // Validar campos requeridos
    const errores: string[] = [];
    if (!id_usuario_puesto) errores.push("El campo 'id_usuario_puesto' es obligatorio");
    if (!id_usuario_puesto_2) errores.push("El campo 'id_usuario_puesto_2' es obligatorio");
    if (!ct_clasificacion_prioridad_id) errores.push("El campo 'ct_clasificacion_prioridad_id' es obligatorio");
    if (!ct_forma_entrega_id) errores.push("El campo 'ct_forma_entrega_id' es obligatorio");
    if (!folio_correspondencia) errores.push("El campo 'folio_correspondencia' es obligatorio");
    if (!resumen_correspondencia) errores.push("El campo 'resumen_correspondencia' es obligatorio");
    if (!ct_usuarios_in) errores.push("El campo 'ct_usuarios_in' es obligatorio");
    if (!fecha_correspondencia) errores.push("El campo 'fecha_correspondencia' es obligatorio");

    if (errores.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Error de validación", 
        errores 
      });
    }

    // Validar que ct_usuarios_in exista en la tabla ct_usuario
    const usuarioExiste = await promette.ct_usuario.findOne({
      where: { id_usuario: ct_usuarios_in },
    });

    if (!usuarioExiste) {
      return res.status(400).json({ message: 'El usuario proporcionado no existe en la tabla ct_usuario' });
    }

    // Validar que los puestos existan y tengan estado = 1
    const puestoExiste = await promette.rl_usuario_puesto.findOne({
      where: { 
        id_usuario_puesto: id_usuario_puesto,
        estado: 1 // Solo puestos activos
      },
    });

    if (!puestoExiste) {
      return res.status(400).json({ message: 'El puesto del remitente no existe o no está activo' });
    }

    const puestoDestinatarioExiste = await promette.rl_usuario_puesto.findOne({
      where: { 
        id_usuario_puesto: id_usuario_puesto_2,
        estado: 1 // Solo puestos activos
      },
    });

    if (!puestoDestinatarioExiste) {
      return res.status(400).json({ message: 'El puesto del destinatario no existe o no está activo' });
    }

    // Obtener el remitente y el destinatario usando la lógica de obtenerRemitente
    const remitente = await obtenerRemitente(id_usuario_puesto);
    const destinatario = await obtenerRemitente(id_usuario_puesto_2);

    // Formatear la fecha de correspondencia
    const fechaFormateada = formatearFecha(fecha_correspondencia);

    // Generar el valor incremental
    const valorIncremental = await obtenerValorIncremental();

    // Generar el folio_sistema
    const folioSistema = `${destinatario}-${remitente}-${valorIncremental}`;

    // Validar la longitud del folio
    if (folioSistema.length > 50) { // Ajusta el valor según la longitud máxima de la columna
        return res.status(400).json({ 
            success: false, 
            message: 'El folio generado excede la longitud máxima permitida' 
        });
    }

    // Renombrar el archivo con el folio
    const oldPath = req.file.path;
    const newPath = path.join(
      path.dirname(oldPath),
      `${folioSistema}.pdf`
    );

    // Renombrar el archivo
    fs.renameSync(oldPath, newPath);

    // Insertar la correspondencia con el nombre del archivo
    const correspondencia = await promette.dt_correspondencia.create({
      ct_clasificacion_prioridad_id,
      ct_forma_entrega_id,
      fecha_correspondencia: fechaFormateada,
      folio_correspondencia,
      resumen_correspondencia,
      ruta_correspondencia: `${folioSistema}.pdf`,
      folio_sistema: folioSistema,
      ct_usuarios_in
    });

    // Obtener el id_correspondencia generado
    const id_correspondencia = correspondencia.id_correspondencia;

    // Insertar en la tabla rl_correspondencia_usuario_estado
    await promette.rl_correspondencia_usuario_estado.create({
      dt_correspondencia_id: id_correspondencia,
      rl_usuario_puesto_id: id_usuario_puesto_2,
      ct_correspondencia_estado: 1,
      observaciones: '',
      ct_usuarios_in: ct_usuarios_in,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Correspondencia creada exitosamente",
      data: correspondencia
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error detallado:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Error al insertar la correspondencia', 
        error: error.message 
      });
    } else {
      console.error('Error desconocido:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al insertar la correspondencia', 
        error: 'Error desconocido' 
      });
    }
  }
};


const obtenerRemitente = async (id_usuario_puesto: number): Promise<string> => {
  try {
    // Buscar el registro en rl_usuario_puesto
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { id_usuario_puesto }
    });

    if (!usuarioPuesto) {
      throw new Error('Usuario puesto no encontrado');
    }

    // Obtener ct_puesto_id
    const ctPuestoId = usuarioPuesto.ct_puesto_id;

    // Buscar el puesto en ct_puesto
    const puesto = await promette.ct_puesto.findOne({
      where: { id_puesto: ctPuestoId }
    });

    if (!puesto) {
      throw new Error('Puesto no encontrado');
    }

    // Obtener ct_area_id
    const ctAreaId = puesto.ct_area_id;

    // Llamar al endpoint de INFRAESTRUCTURA_API para obtener el área
    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`; // Ajusta la ruta según tu API
    const response = await axios.get(infraestructuraApiUrl);
    const areasExternas = response.data; // Suponiendo que la respuesta es un array de áreas

    // Buscar el área correspondiente
    const areaExterna = areasExternas.find((area: any) => area.id_area === ctAreaId);

    if (!areaExterna) {
      throw new Error('Área no encontrada en el endpoint externo');
    }

    // Obtener el nombre del área
    const nombreArea: string = areaExterna.nombre;

    // Normalizar el texto para quitar acentos
    const normalizarAcentos = (texto: string): string => {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const nombreAreaNormalizado = normalizarAcentos(nombreArea);

    // Lista de palabras a excluir (artículos, preposiciones, etc.)
    const palabrasExcluidas: string[] = [
      'de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'a', 'para', 'con', 'por', 'al'
    ];

    // Identificar siglas o términos clave entre paréntesis
    const siglas = nombreAreaNormalizado.match(/\(([^)]+)\)/g)?.map(s => s.replace(/[()]/g, '')) || [];
    const palabrasClave = nombreAreaNormalizado.split(' ')
      .filter(palabra => 
        !palabrasExcluidas.includes(palabra.toLowerCase()) &&
        !palabra.startsWith('(') && 
        palabra.length > 3
      );

    // Combinar siglas y palabras clave, luego tomar las primeras letras
    const todasLasPalabras = [...siglas, ...palabrasClave];
    let abreviacion = todasLasPalabras
      .map(p => p.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);

    // Si no hay suficientes letras, tomar las primeras letras del nombre completo
    if (abreviacion.length < 2) {
      abreviacion = nombreAreaNormalizado
        .split(' ')
        .filter(p => !palabrasExcluidas.includes(p.toLowerCase()))
        .join('')
        .substring(0, 3)
        .toUpperCase();
    }

    return abreviacion;
  } catch (error) {
    console.error('Error en obtenerRemitente:', error);
    throw new Error('Error al obtener el remitente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
};

const obtenerValorIncremental = async (): Promise<string> => {
  try {
    // Obtener todos los folios que NO terminan en -1
    const correspondencias = await promette.dt_correspondencia.findAll({
      where: {
        folio_sistema: {
          [Op.notLike]: '%-1'
        }
      },
      attributes: ['folio_sistema']
    });

    if (!correspondencias || correspondencias.length === 0) {
      return '0000';
    }

    // Extraer el valor incremental de cada folio y encontrar el mayor
    let maxIncremental = 0;
    correspondencias.forEach((corr: any) => {
      const partes = corr.folio_sistema.split('-');
      const valor = parseInt(partes[partes.length - 1], 10);
      if (!isNaN(valor) && valor > maxIncremental) {
        maxIncremental = valor;
      }
    });

    // Siguiente valor incremental, formateado a 4 dígitos
    return (maxIncremental + 1).toString().padStart(4, '0');
  } catch (error) {
    console.error('Error en obtenerValorIncremental:', error);
    throw new Error('Error al obtener el valor incremental: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
};

export const obtenerCorrespondencia = async (req: Request, res: Response) => {
  try {
    const { 
      fecha, 
      ct_clasificacion_prioridad_id, 
      ct_forma_entrega_id, 
      id_usuario,
      estado // Nuevo parámetro opcional para filtrar por estado
    } = req.body;

    if (!promette) {
      return res.status(500).json({ message: "Error de conexión con la base de datos" });
    }

    let id_usuario_puestos: number[] = [];
    if (id_usuario) {
      const usuarioPuestos = await promette.rl_usuario_puesto.findAll({
        where: { ct_usuario_id: id_usuario },
        attributes: ['id_usuario_puesto']
      });
      id_usuario_puestos = usuarioPuestos.map((up: any) => up.id_usuario_puesto);
    }

    // Construir condiciones de filtro
    const whereConditions: any = {};
    
    if (fecha) {
      whereConditions.fecha_correspondencia = {
        [Op.between]: [
          new Date(new Date(fecha).setUTCHours(0, 0, 0, 0)).toISOString(),
          new Date(new Date(fecha).setUTCHours(23, 59, 59, 999)).toISOString()
        ]
      };
    }
    
    if (ct_clasificacion_prioridad_id) {
      whereConditions.ct_clasificacion_prioridad_id = ct_clasificacion_prioridad_id;
    }
    
    if (ct_forma_entrega_id) {
      whereConditions.ct_forma_entrega_id = ct_forma_entrega_id;
    }

    // Obtener todas las correspondencias con sus relaciones
    const correspondencias = await promette.dt_correspondencia.findAll({
      attributes: [
        "id_correspondencia", "folio_sistema", "fecha_correspondencia",
        "folio_correspondencia", "resumen_correspondencia",
        "ruta_correspondencia", "ct_usuarios_in"
      ],
      include: [
        {
          model: promette.ct_clasificacion_prioridad,
          as: "ct_clasificacion_prioridad",
          attributes: ["nombre_prioridad"],
        },
        {
          model: promette.ct_forma_entrega,
          as: "ct_forma_entrega",
          attributes: ["nombre_entrega"],
        },
        {
          model: promette.rl_correspondencia_usuario_estado,
          as: "rl_correspondencia_usuario_estados",
          attributes: [
            "ct_correspondencia_estado", "observaciones",
            "id_correspondencia_usuario", "ct_usuarios_in",
            "rl_usuario_puesto_id", "createdAt"
          ],
          include: [
            {
              model: promette.ct_correspondencia_estado,
              as: "ct_correspondencia_estado_ct_correspondencia_estado",
              attributes: ["nombre_estado"]
            }
          ]
        }
      ],
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });

    // Filtrar correspondencias según el usuario y estado
    const correspondenciaFiltrada = await Promise.all(
      correspondencias.map(async (corr: any) => {
        const estados = corr.rl_correspondencia_usuario_estados || [];
        
        // Verificar si el usuario tiene acceso a esta correspondencia
        // El usuario puede ver la correspondencia si:
        // 1. Es el creador original (ct_usuarios_in)
        // 2. Tiene algún registro en rl_correspondencia_usuario_estado con su id_usuario_puesto
        const tieneAcceso = 
          corr.ct_usuarios_in === Number(id_usuario) || 
          estados.some((estado: any) => id_usuario_puestos.includes(estado.rl_usuario_puesto_id));

        if (!tieneAcceso) {
          return null;
        }

        // Ordenar estados por fecha descendente para obtener el más reciente
        const estadoMasReciente = estados.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        // Si se proporciona un estado específico, filtrar por ese estado
        if (estado !== undefined) {
          // Buscar si el usuario tiene un registro con el estado especificado
          const estadoUsuario = estados.find((est: any) => 
            est.ct_correspondencia_estado === estado && 
            id_usuario_puestos.includes(est.rl_usuario_puesto_id)
          );
          
          if (estadoUsuario) {
            // Excluir correspondencias con folio_sistema que termina en -1 si el estado es 3
            if (estado === 3 && corr.folio_sistema.endsWith('-1')) {
              return null;
            }
            return corr;
          }
          return null;
        } 
        // Si no se proporciona estado, mostrar correspondencias donde el usuario tiene estado 1
        else {
          // Buscar si el usuario tiene un registro con estado 1
          const estadoUsuario = estados.find((est: any) => 
            est.ct_correspondencia_estado === 1 && 
            id_usuario_puestos.includes(est.rl_usuario_puesto_id)
          );
          
          if (estadoUsuario) {
            return corr;
          }
        }
        return null;
      })
    );

    // Eliminar nulos y formatear fechas
    const correspondenciaFinal = correspondenciaFiltrada
      .filter((corr: any) => corr !== null)
      .map((item: any) => {
        const fechaLocal = new Date(item.fecha_correspondencia);
        fechaLocal.setMinutes(fechaLocal.getMinutes() - fechaLocal.getTimezoneOffset());
        return {
          ...item.dataValues,
          fecha_correspondencia: fechaLocal.toISOString().slice(0, 10),
        };
      });

    res.json({ success: true, data: correspondenciaFinal });
  } catch (error) {
    console.error("Error al obtener la correspondencia:", error);
    res.status(500).json({ success: false, message: "Error al obtener la correspondencia" });
  }
};


export const editarObservacionesYEstado = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ message: "Error de conexión con la base de datos" });
    }

    const {
      dt_correspondencia_id,
      observaciones,
      ct_correspondencia_estado,
      id_usuario_puesto_2
    } = req.body;

    const estado = Number(ct_correspondencia_estado);
    const archivo = req.file;
    const errores: string[] = [];

    if (!dt_correspondencia_id) errores.push("El campo 'dt_correspondencia_id' es obligatorio");
    if (ct_correspondencia_estado === undefined) errores.push("El campo 'ct_correspondencia_estado' es obligatorio");

    const estadoExiste = await promette.ct_correspondencia_estado.findOne({
      where: { id_correspondencia_estado: estado }
    });
    if (!estadoExiste) errores.push("El estado proporcionado no existe");

    if (estado === 4 && !id_usuario_puesto_2) {
      errores.push("El campo 'id_usuario_puesto_2' es obligatorio para derivaciones (estado 4)");
    }

    if (errores.length > 0) {
      return res.status(400).json({ success: false, message: "Error de validación", errores });
    }

    const registroActual = await promette.rl_correspondencia_usuario_estado.findOne({
      where: { dt_correspondencia_id },
      order: [['createdAt', 'DESC']]
    });

    if (!registroActual) {
      return res.status(404).json({ success: false, message: "Registro no encontrado" });
    }

    if ([2, 5, 6].includes(estado)) {
      await promette.rl_correspondencia_usuario_estado.update(
        {
          ct_correspondencia_estado: estado,
          observaciones: observaciones || null,
          rl_usuario_puesto_id: id_usuario_puesto_2 || registroActual.rl_usuario_puesto_id
        },
        {
          where: { id_correspondencia_usuario: registroActual.id_correspondencia_usuario }
        }
      );

      return res.status(200).json({
        success: true,
        message: "Estado y observaciones actualizados correctamente"
      });
    }

    if (estado === 3) {
      if (archivo) {
        const correspondenciaOriginal = await promette.dt_correspondencia.findOne({
          where: { id_correspondencia: dt_correspondencia_id }
        });

        if (!correspondenciaOriginal) {
          return res.status(404).json({ success: false, message: "Correspondencia original no encontrada" });
        }

        if (correspondenciaOriginal.folio_sistema.endsWith('-1')) {
          return res.status(400).json({
            success: false,
            message: "No se puede responder a una correspondencia que ya es una respuesta"
          });
        }

        const folioRespuesta = `${correspondenciaOriginal.folio_sistema}-1`;
        const existeRespuesta = await promette.dt_correspondencia.findOne({
          where: { folio_sistema: folioRespuesta }
        });

        if (existeRespuesta) {
          return res.status(400).json({
            success: false,
            message: "Ya existe una respuesta para esta correspondencia"
          });
        }

        try {
          const nuevoFolio = `${correspondenciaOriginal.folio_sistema}-1`;
          const LIMITE_FOLIO = 15;
          if (nuevoFolio.length > LIMITE_FOLIO) {
            return res.status(400).json({
              success: false,
              message: `El folio generado (${nuevoFolio}) excede la longitud máxima permitida (${LIMITE_FOLIO} caracteres).`
            });
          }

          let rutaGuardada = correspondenciaOriginal.ruta_correspondencia;
          const ext = path.extname(archivo.originalname);
          const nombreArchivo = `${nuevoFolio}${ext}`;
          const rutaBase = process.env.UPLOAD_BASE_PATH
            ? path.join(process.env.UPLOAD_BASE_PATH, "correspondenciaFile")
            : 'correspondenciaFile';
          const rutaFinal = path.join(rutaBase, nombreArchivo);

          if (!fs.existsSync(rutaBase)) fs.mkdirSync(rutaBase, { recursive: true });

          if (archivo.buffer) {
            fs.writeFileSync(rutaFinal, archivo.buffer);
          } else if (archivo.path) {
            fs.renameSync(archivo.path, rutaFinal);
          }

          rutaGuardada = nombreArchivo;

          const nuevaCorrespondencia = await promette.dt_correspondencia.create({
            ...correspondenciaOriginal.dataValues,
            id_correspondencia: undefined,
            folio_sistema: nuevoFolio,
            ruta_correspondencia: rutaGuardada,
            fecha_correspondencia: new Date().toISOString().slice(0, 19).replace('T', ' '),
            createdAt: new Date(),
            updatedAt: new Date()
          });

          const rl_usuario_puesto_id_original = registroActual.rl_usuario_puesto_id;

          await promette.rl_correspondencia_usuario_estado.create({
            dt_correspondencia_id: nuevaCorrespondencia.id_correspondencia,
            rl_usuario_puesto_id: id_usuario_puesto_2 || rl_usuario_puesto_id_original,
            ct_correspondencia_estado: 3,
            observaciones: null,
            ct_usuarios_in: registroActual.ct_usuarios_in,
            createdAt: new Date()
          });

          await promette.rl_correspondencia_usuario_estado.update(
            {
              ct_correspondencia_estado: 3,
              observaciones: observaciones || null,
              rl_usuario_puesto_id: id_usuario_puesto_2 || registroActual.rl_usuario_puesto_id
            },
            {
              where: { id_correspondencia_usuario: registroActual.id_correspondencia_usuario }
            }
          );

          return res.status(200).json({
            success: true,
            message: "Respuesta registrada correctamente",
            data: {
              nueva_correspondencia: {
                id_correspondencia: nuevaCorrespondencia.id_correspondencia,
                folio_sistema: nuevaCorrespondencia.folio_sistema
              }
            }
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Error al registrar la respuesta con archivo",
            error: error instanceof Error ? error.message : "Error desconocido"
          });
        }
      } else {
        await promette.rl_correspondencia_usuario_estado.update(
          {
            ct_correspondencia_estado: 3,
            observaciones: observaciones || null,
            rl_usuario_puesto_id: id_usuario_puesto_2
          },
          {
            where: { id_correspondencia_usuario: registroActual.id_correspondencia_usuario }
          }
        );

        return res.status(200).json({
          success: true,
          message: "Estado y observaciones actualizados correctamente en la correspondencia original (sin archivo ni clonación)"
        });
      }
    }

    // === ESTADO 4 ===
    if (estado === 4) {
      try {
        // Actualizar el estado actual a 4 con observaciones
        await promette.rl_correspondencia_usuario_estado.update(
          {
            ct_correspondencia_estado: 4,
            observaciones: observaciones || null,
            rl_usuario_puesto_id: id_usuario_puesto_2 || registroActual.rl_usuario_puesto_id
          },
          {
            where: { id_correspondencia_usuario: registroActual.id_correspondencia_usuario }
          }
        );

        // Crear nuevo registro para el nuevo destinatario con estado 1
        await promette.rl_correspondencia_usuario_estado.create({
          dt_correspondencia_id: dt_correspondencia_id,
          rl_usuario_puesto_id: id_usuario_puesto_2,
          ct_correspondencia_estado: 1,
          observaciones: null,
          ct_usuarios_in: registroActual.ct_usuarios_in,
          createdAt: new Date(),
        });

        return res.status(200).json({
          success: true,
          message: "Correspondencia derivada correctamente al nuevo destinatario"
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error al derivar la correspondencia",
          error: error instanceof Error ? error.message : "Error desconocido"
        });
      }
    }

    // Si el estado no es 2, 3, 4, 5 ni 6, retornar error
    return res.status(400).json({
      success: false,
      message: "Estado no válido. Solo se permiten los estados de respuesta"
    });

  } catch (error) {
    console.error("Error al editar observaciones y estado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};



// Exportar las funciones
export { upload };
export const enviarCURPsARUPEET = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Token de autenticación no proporcionado" });
  }

  try {
    const resultado = await PuestoAreaHelper.obtenerInformacionCURPs(token);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al enviar CURPs a RUPEET:", error);
    return res.status(500).json({ msg: "Error al procesar la solicitud" });
  }
};


const router = Router();

// Ruta para insertar correspondencia con archivo PDF
router.post('/correspondencia', (req, res, next) => {
  if (!upload) {
    return res.status(400).json({ message: 'La variable de entorno UPLOAD_BASE_PATH no está definida. No se puede manejar la carga de archivos.' });
  }
  upload.single('ruta_correspondencia')(req, res, next);
}, async (req: Request, res: Response) => {
  try {
    // Verificar si el archivo se recibió correctamente
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ningún archivo PDF' });
    }

    // Verificar si el archivo se ha guardado correctamente en la carpeta
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({ message: 'El archivo no se ha guardado correctamente en la carpeta.' });
    }

    console.log('Archivo recibido:', req.file); // Depuración
    const {
      id_usuario_puesto,
      id_usuario_puesto_2,
      ct_clasificacion_prioridad_id,
      ct_forma_entrega_id,
      folio_correspondencia,
      resumen_correspondencia
    } = req.body;

    // Obtener el remitente para id_usuario_puesto
    const remitente = await obtenerRemitente(id_usuario_puesto);

    // Obtener el destinatario para id_usuario_puesto_2
    const destinatario = await obtenerRemitente(id_usuario_puesto_2);

    // Generar el valor incremental
    const valorIncremental = await obtenerValorIncremental();

    // Generar el folio_sistema con el valor de id_usuario_puesto_2
    const folioSistema = `${destinatario}-${remitente}-${valorIncremental}`;

    // Renombrar el archivo con el folio
    const oldPath = req.file.path;
    const newPath = path.join(
      path.dirname(oldPath),
      `${folioSistema}.pdf`
    );

    // Renombrar el archivo
    fs.renameSync(oldPath, newPath);

    // Insertar la correspondencia con el nombre del archivo
    const correspondencia = await promette.dt_correspondencia.create({
      ct_clasificacion_prioridad_id,
      ct_forma_entrega_id,
      fecha_correspondencia: new Date().toISOString().slice(0, 19).replace('T', ' '), // Guardar la fecha en formato YYYY-MM-DD HH:MM:SS
      folio_correspondencia,
      resumen_correspondencia,
      ruta_correspondencia: `${folioSistema}.pdf`, // Guardar el nombre del archivo con extensión
      folio_sistema: folioSistema
    });

    res.status(201).json(correspondencia);
  } catch (error) {
    // Verificar si el error es de tipo Error
    if (error instanceof Error) {
      console.error('Error detallado:', error.message); // Muestra el mensaje de error en la consola
      res.status(500).json({ message: 'Error al insertar la correspondencia', error: error.message });
    } else {
      console.error('Error desconocido:', error); // Muestra el error completo si no es de tipo Error
      res.status(500).json({ message: 'Error al insertar la correspondencia', error: 'Error desconocido' });
    }
  }
});


//Metodo para obtener un documento en esfecifio de un aspirante 
export const Documentscorrespondencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const {fileRoute } = req.params;

    modelsValidator(req, res);

    const rutaInfografia = fileRoute;
    const uploadBasePath = `${process.env.UPLOAD_BASE_PATH}/correspondenciaFile/` || '';

    const rutaCompleta = path.join(uploadBasePath, rutaInfografia);

    // Verificar si el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      res.status(404).json({ success: false, message: "Archivo no encontrado" });
      return;
    }

    // Enviar el archivo como respuesta
    res.sendFile(rutaCompleta);
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    res.status(400).json({
      success: false,
      message: "Error al obtener el documento",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Función para generar PDF de correspondencia
export const generarPDFCorrespondencia = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const { id_correspondencia } = req.params;

    const correspondencia = await promette.dt_correspondencia.findOne({
      where: { id_correspondencia },
      include: [
        {
          model: promette.ct_clasificacion_prioridad,
          as: "ct_clasificacion_prioridad",
          attributes: ["nombre_prioridad"],
        },
        {
          model: promette.ct_forma_entrega,
          as: "ct_forma_entrega",
          attributes: ["nombre_entrega"],
        },
        {
          model: promette.rl_correspondencia_usuario_estado,
          as: "rl_correspondencia_usuario_estados",
          include: [
            {
              model: promette.ct_correspondencia_estado,
              as: "ct_correspondencia_estado_ct_correspondencia_estado",
              attributes: ["nombre_estado"],
            },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuarios_in_ct_usuario",
          attributes: ["id_usuario", "curp"],
        },
      ],
    });

    if (!correspondencia) {
      res.status(404).json({ success: false, message: "Correspondencia no encontrada" });
      return;
    }

    const token = req.headers.authorization?.split(" ")[1] || "";
    
    // REMITENTE: quien crea/firma la correspondencia (ct_usuarios_in)
    const curpRemitente = correspondencia.ct_usuarios_in_ct_usuario?.curp || '';
    let nombreRemitente = "N/A";
    let areaRemitente = "N/A";
    if (curpRemitente) {
      try {
        const remitenteData = await PuestoAreaHelper.obtenerNombrePorCurp(curpRemitente, token);
        if (remitenteData.success) {
          nombreRemitente = remitenteData.nombre;
          areaRemitente = remitenteData.area;
        } else {
          nombreRemitente = remitenteData.nombre;
          areaRemitente = remitenteData.area;
        }
      } catch (error) {
        console.error("Error al obtener remitente:", error);
        nombreRemitente = "Error al obtener información";
      }
    }

    // DESTINATARIO: quien recibe la correspondencia (rl_usuario_puesto_id)
    let nombreDestinatario = "N/A";
    let areaDestinatario = "N/A";
    
    // Obtener el estado más reciente para determinar el destinatario actual
    const estados = correspondencia.rl_correspondencia_usuario_estados || [];
    const estadoMasReciente = estados.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const rlUsuarioPuestoId = estadoMasReciente?.rl_usuario_puesto_id;
    if (rlUsuarioPuestoId) {
      try {
        const destinatarioData = await PuestoAreaHelper.obtenerNombrePorUsuarioPuesto(rlUsuarioPuestoId, token);
        if (destinatarioData.success) {
          nombreDestinatario = destinatarioData.nombre;
          areaDestinatario = destinatarioData.area;
        } else {
          nombreDestinatario = destinatarioData.nombre;
          areaDestinatario = destinatarioData.area;
        }
      } catch (error) {
        console.error("Error al obtener destinatario:", error);
        nombreDestinatario = "Error al obtener información";
      }
    }

    const doc = new PDFDocument({ size: "A4", margin: 20 });

       // Agregar imagen de fondo
       const fondoPath = path.join(__dirname, '../../public/florfondo.jpg');
       if (fs.existsSync(fondoPath)) {
         doc.image(fondoPath, 5, 10, { width: doc.page.width - 100, height: doc.page.height - 100 });
       }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=correspondencia.pdf`
    );

    const dimensionesRecuadros = [
     { x: 20, y: 30, ancho: 400, alto: 70 },
     { x: 420, y: 30, ancho: 170, alto: 70 },
     { x: 20, y: 100, ancho: 320, alto: 600 },
     { x: 330, y: 100, ancho: 270, alto: 430 },
     { x: 20, y: 690, ancho: 320, alto: 150 },
     { x: 330, y: 520, ancho: 270, alto: 320 },
    ];

    const margen = 10;

    const calcularAlturaNecesaria = (contenido: string, anchoDisponible: number, fontSize: number = 9): number => {
      if (!contenido) return 0;
      const caracteresPorLinea = Math.floor(anchoDisponible / (fontSize * 0.6));
      const numeroLineas = Math.ceil(contenido.length / caracteresPorLinea);
      return numeroLineas * fontSize * 1.2;
    };

    // Calcular alturas dinámicas
    const alturaCase2 = calcularAlturaNecesaria(correspondencia.resumen_correspondencia || '', 300) + 200;
    const observaciones = correspondencia.rl_correspondencia_usuario_estados
      .filter((estado: any) => estado.observaciones && estado.observaciones.trim() !== '')
      .map((estado: any) => estado.observaciones)
      .join(' ');
    const alturaCase3 = calcularAlturaNecesaria(observaciones, 250) + 150;
    const alturaCase5 = calcularAlturaNecesaria(correspondencia.resumen_correspondencia || '', 300) + 100;

    // Ajustar dimensiones
    dimensionesRecuadros[2].alto = Math.max(600, alturaCase2);
    dimensionesRecuadros[3].alto = Math.max(430, alturaCase3);
    dimensionesRecuadros[5].alto = Math.max(320, alturaCase5);

    // Solo ajustar casos específicos
    const ajustarCasosEspecificos = {
      resumen: true,        // Case 2 - Asunto
      observaciones: true,  // Case 3 - Observaciones
      acuerdos: true        // Case 5 - Resumen
    };

    // Aplicar solo donde se necesite
    if (ajustarCasosEspecificos.resumen) {
      dimensionesRecuadros[2].alto = Math.max(600, calcularAlturaNecesaria(correspondencia.resumen_correspondencia || '', 300) + 200);
    }

    if (ajustarCasosEspecificos.observaciones) {
      dimensionesRecuadros[3].alto = Math.max(430, calcularAlturaNecesaria(observaciones, 250) + 150);
    }

    if (ajustarCasosEspecificos.acuerdos) {
      dimensionesRecuadros[5].alto = Math.max(320, calcularAlturaNecesaria(correspondencia.resumen_correspondencia || '', 300) + 100);
    }

    // Constante para separación consistente entre etiquetas y datos
    const SEPARACION_ETIQUETA_DATO = 8;

    for (let i = 0; i < dimensionesRecuadros.length; i++) {
      const recuadro = dimensionesRecuadros[i];
      const { x, y, ancho, alto } = recuadro;

      doc.roundedRect(x, y, ancho - margen * 2, alto - margen * 2, 10).stroke();

      switch (i) {
        case 0:
          // === CONFIGURACIÓN AJUSTABLE DE LA IMAGEN Y EL TEXTO ===
          // --- Imagen ---
          // Ajusta estos valores para mover la imagen
          const imgWidth = 200; // Ancho de la imagen
          let imgHeight = 30;  // Alto de la imagen (se ajusta automáticamente si es posible)
          const imgOffsetX = 10; // Desplazamiento horizontal de la imagen dentro del recuadro
          const imgOffsetY = 3; // Desplazamiento vertical de la imagen dentro del recuadro

          // --- Texto ---
          // Ajusta estos valores para mover el texto
          const textoFontSize = 18; // Tamaño de fuente del texto
          const textoOffsetX = 20; // Espacio entre la imagen y el texto
          const textoOffsetY = 0;  // Desplazamiento vertical extra del texto
          const textoWidth = 200;  // Ancho del área del texto

          const usetPathCase0 = path.join(__dirname, '../../public/USET.png');
          if (fs.existsSync(usetPathCase0)) {
            try {
              const sizeOf = require('image-size');
              const dimensions = sizeOf(usetPathCase0);
              imgHeight = Math.round(dimensions.height * (imgWidth / dimensions.width));
            } catch (e) {
              imgHeight = 50;
            }
            doc.image(
              usetPathCase0,
              x + imgOffsetX, // Mueve la imagen horizontalmente
              y + imgOffsetY, // Mueve la imagen verticalmente
              { width: imgWidth, height: imgHeight }
            );
          }

          // Posición horizontal del texto: después de la imagen + espacio extra
          const textoX = x + imgOffsetX + imgWidth + textoOffsetX;
          // Posición vertical del texto: centrado respecto al recuadro, más offset
          const textoY = y + ((alto - textoFontSize) / 2) + textoOffsetY;

          doc.fontSize(textoFontSize)
            .fillColor("#000000")
            .text(
              "ACUSE",
              textoX,
              textoY,
              {
                width: textoWidth, // Puedes ajustar el ancho del área del texto
                align: "center"
              }
            );
          break;
        case 1:
          doc.fontSize(11).fillColor("#000000").text(`Folio: ${correspondencia.folio_sistema}`, x + 10, y + 25, {
            width: ancho - margen * 2,
            align: "left",
          });
         
          break;
        case 2:
          doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("DESCRIPCIÓN DE LA CORRESPONDENCIA", x + 10, y + 15, {
            width: ancho - margen * 2,
            align: "center",
          });

          let yOffset = y + 45;
          const anchoDisponible = ancho - margen * 2;
          const anchoEtiqueta = 120;
          const anchoValor = anchoDisponible - anchoEtiqueta - 10;

          const agregarCampo = (etiqueta: string, valor: string | undefined) => {
            const valorTexto = valor || "N/A";
            
            // MODIFICAR TAMAÑO DE LETRA DE ETIQUETAS: cambiar fontSize(9) por el tamaño deseado
            doc.font('Helvetica-Bold').fontSize(9).fillColor("#000000").text(`${etiqueta}:`, x + 10, yOffset, {
              width: anchoEtiqueta,
              align: "left"
            });
            
            // MODIFICAR TAMAÑO DE LETRA DE VALORES: cambiar fontSize(9) por el tamaño deseado
            // MODIFICAR ESPACIO HORIZONTAL ENTRE ETIQUETA Y VALOR: cambiar + 20 por el espaciado deseado
            doc.font('Helvetica').fontSize(9).fillColor("#000000").text(valorTexto, x + anchoEtiqueta + SEPARACION_ETIQUETA_DATO, yOffset, {
              width: anchoValor,
              align: "left"
            });
            
            // MODIFICAR ALTURA ENTRE CAMPOS: cambiar yOffset += 25 por el espaciado deseado
            yOffset += 25;
          };

          agregarCampo("Fecha de Recepción", correspondencia.createdAt ? new Date(correspondencia.createdAt).toLocaleDateString() : undefined);
          agregarCampo("Fecha de la correspondencia", correspondencia.fecha_correspondencia ? new Date(correspondencia.fecha_correspondencia).toLocaleDateString() : undefined);
          agregarCampo("Fecha límite de respuesta", correspondencia.fecha_correspondencia ? new Date(correspondencia.fecha_correspondencia).toLocaleDateString() : undefined);
          agregarCampo("Número de Oficio", correspondencia.folio_correspondencia);
          agregarCampo("Tipo", correspondencia.ct_forma_entrega?.nombre_entrega);
          agregarCampo("En respuesta", "N/A");
          agregarCampo("Asunto", correspondencia.resumen_correspondencia);
          
          // MODIFICAR ESPACIADO EXTRA ANTES DE REMITENTE/DESTINATARIO: cambiar yOffset += 15 por el espaciado deseado
          yOffset += 10;
          agregarCampo("Remitente", `${nombreRemitente} - ${areaRemitente}`);
          agregarCampo("Destinatario Inicial", `${nombreDestinatario} - ${areaDestinatario}`);
          
          // MODIFICAR ESPACIADO EXTRA ANTES DEL ÚLTIMO CAMPO: cambiar yOffset += 10 por el espaciado deseado
          yOffset += 5;
          agregarCampo("DETALLE", "N/A");
          
          // MODIFICAR ESPACIADO DESPUÉS DE CAMPOS PREDEFINIDOS: cambiar yOffset += 8 por el espaciado deseado (2mm aprox)
          yOffset += 5;
          break;
        case 3:
          doc.font('Helvetica-Bold').fontSize(11).fillColor("#000000").text("TURNAR A:", x + 10, y + 15, {
            width: ancho - margen * 2,
            align: "center",
          });

          // Mostrar personas y áreas a quienes se turnó o retornó (estado 4)
          let yTurno = y + 45;
          const anchoTurno = ancho - margen * 2 - 10;
          const estadosTurno = (correspondencia.rl_correspondencia_usuario_estados || []).filter((estado: any) => estado.ct_correspondencia_estado === 4);

          if (estadosTurno.length === 0) {
            // Si no hay turnos, mostrar el usuario actual o quien la terminó
            const estados = correspondencia.rl_correspondencia_usuario_estados || [];
            let usuarioFinalId = null;
            let estadoFinal = null;
            if (estados.length > 0) {
              // Ordenar por fecha descendente para obtener el último
              const ultimoEstado = estados.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              usuarioFinalId = ultimoEstado.rl_usuario_puesto_id;
              estadoFinal = ultimoEstado.ct_correspondencia_estado;
            }
            let nombreFinal = "N/A";
            let areaFinal = "N/A";
            if (usuarioFinalId) {
              try {
                const finalData = await PuestoAreaHelper.obtenerNombrePorUsuarioPuesto(usuarioFinalId, token);
                if (finalData.success) {
                  nombreFinal = finalData.nombre;
                  areaFinal = finalData.area;
                } else {
                  nombreFinal = finalData.nombre;
                  areaFinal = finalData.area;
                }
              } catch (error) {
                nombreFinal = "Error al obtener información";
              }
            }
            let textoEstado = "Usuario actual con la correspondencia:";
            if (estadoFinal === 5 || estadoFinal === 6) {
              textoEstado = "Usuario que concluyó la correspondencia:";
            }
            doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text(textoEstado, x + 15, yTurno);
            yTurno += 18;
            
            // === DATOS CON SEPARACIÓN CONSISTENTE ===
            // Calcular ancho de etiqueta "Persona:" y aplicar separación
            const anchoEtiquetaPersona = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Persona:");
            doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Persona:", x + 15, yTurno);
            doc.font('Helvetica').fontSize(9).fillColor("#000000").text(nombreFinal, x + 15 + anchoEtiquetaPersona + SEPARACION_ETIQUETA_DATO, yTurno, {
              width: anchoTurno - (15 + anchoEtiquetaPersona + SEPARACION_ETIQUETA_DATO),
              align: "left",
            });
            yTurno += 25;
            
            // Calcular ancho de etiqueta "Área:" y aplicar separación
            const anchoEtiquetaArea = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Área:");
            doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Área:", x + 15, yTurno);
            doc.font('Helvetica').fontSize(10).fillColor("#000000").text(areaFinal, x + 15 + anchoEtiquetaArea + SEPARACION_ETIQUETA_DATO, yTurno, {
              width: anchoTurno - (15 + anchoEtiquetaArea + SEPARACION_ETIQUETA_DATO),
              align: "left",
            });
            yTurno += 18;
            
            // Agregar observaciones desde rl_correspondencia_usuario_estado
            const observacionesTurno = correspondencia.rl_correspondencia_usuario_estados
              .filter((estado: any) => estado.observaciones && estado.observaciones.trim() !== '')
              .map((estado: any) => estado.observaciones);
            
            if (observacionesTurno.length > 0) {
              // Calcular ancho de etiqueta "Observaciones:" y aplicar separación
              const anchoEtiquetaObs = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Observaciones:");
              doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Observaciones:", x + 15, yTurno);
              yTurno += 15;
              
              observacionesTurno.forEach((obs: string) => {
                // Las observaciones deben estar alineadas a la izquierda con sangría, no después de la etiqueta
                doc.font('Helvetica').fontSize(10).fillColor("#000000").text(`• ${obs}`, x + 30, yTurno, {
                  width: anchoTurno - 30,
                  align: "left",
                });
                yTurno += 20;
              });
            }
          }
          break;
        case 4:
          doc.font('Helvetica-Bold').fontSize(11).fillColor("#000000").text("REVISIÓN", x + 10, y + 15, {
            width: ancho - margen * 2,
            align: "center",
          });
          
          let yHistorial = y + 45;
          const anchoObservaciones = ancho - margen * 2 - 10;
          
          // === DATOS CON SEPARACIÓN CONSISTENTE ===
          // Calcular ancho de etiqueta "Destinatario:" y aplicar separación
          const anchoEtiquetaDestinatario = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Destinatario:");
          doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Destinatario:", x + 15, yHistorial);
          doc.font('Helvetica').fontSize(10).fillColor("#000000").text(`${nombreDestinatario}`, x + 15 + anchoEtiquetaDestinatario + SEPARACION_ETIQUETA_DATO, yHistorial, {
            width: anchoObservaciones - (15 + anchoEtiquetaDestinatario + SEPARACION_ETIQUETA_DATO),
            align: "left",
          });
          yHistorial += 20;
          
          // Calcular ancho de etiqueta "Área:" y aplicar separación
          const anchoEtiquetaAreaHistorial = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Área:");
          doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Área:", x + 15, yHistorial);
          doc.font('Helvetica').fontSize(10).fillColor("#000000").text(`${areaDestinatario}`, x + 15 + anchoEtiquetaAreaHistorial + SEPARACION_ETIQUETA_DATO, yHistorial, {
            width: anchoObservaciones - (15 + anchoEtiquetaAreaHistorial + SEPARACION_ETIQUETA_DATO),
            align: "left",
          });
          yHistorial += 30;
          break;
        case 5:
          doc.font('Helvetica-Bold').fontSize(11).fillColor("#000000").text("ACUERDOS / INSTRUCCIONES", x + 5, y + 10, {
            width: ancho - margen * 2,
            align: "center",
          });
          
          let yAcuerdos = y + 45;
          const anchoAcuerdos = ancho - margen * 2 - 10;
          
          // Mostrar el resumen de la correspondencia como acuerdos/instrucciones
          if (correspondencia.resumen_correspondencia) {
            doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Resumen de la correspondencia:", x + 15, yAcuerdos);
            yAcuerdos += 18;
            doc.font('Helvetica').fontSize(9).fillColor("#000000").text(correspondencia.resumen_correspondencia, x + 15, yAcuerdos, {
              width: anchoAcuerdos,
              align: "left",
            });
            yAcuerdos += 30;
          }
          
          // === DATOS CON SEPARACIÓN CONSISTENTE ===
          // Mostrar información de prioridad como instrucción
          if (correspondencia.ct_clasificacion_prioridad?.nombre_prioridad) {
            yAcuerdos += 10;
            // Calcular ancho de etiqueta "Prioridad:" y aplicar separación
            const anchoEtiquetaPrioridad = doc.font('Helvetica-Bold').fontSize(10).widthOfString("Prioridad:");
            doc.font('Helvetica-Bold').fontSize(10).fillColor("#000000").text("Prioridad:", x + 15, yAcuerdos);
            doc.font('Helvetica').fontSize(9).fillColor("#000000").text(correspondencia.ct_clasificacion_prioridad.nombre_prioridad, x + 15 + anchoEtiquetaPrioridad + SEPARACION_ETIQUETA_DATO, yAcuerdos, {
              width: anchoAcuerdos - (15 + anchoEtiquetaPrioridad + SEPARACION_ETIQUETA_DATO),
              align: "left",
            });
          }
          break;
      }
    }

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el PDF",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export const obtenerResumenCorrespondenciaPorArea = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ message: "Error de conexión con la base de datos" });
    }

    const { fechaInicio, rl_usuario_puesto_id } = req.query;
    const condiciones: any = {};

    // Filtro por fecha
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio as string);
      if (isNaN(fechaInicioDate.getTime())) {
        return res.status(400).json({ message: "Formato de fecha inválido" });
      }

      const inicioDelDia = new Date(fechaInicioDate.setUTCHours(0, 0, 0, 0));
      const finDelDia = new Date(fechaInicioDate.setUTCHours(23, 59, 59, 999));

      condiciones.createdAt = {
        [Op.between]: [inicioDelDia, finDelDia],
      };
    }

    // Filtro por puesto (opcional)
    if (rl_usuario_puesto_id) {
      condiciones.rl_usuario_puesto_id = rl_usuario_puesto_id;
    }

    // Obtener todas las relaciones con información completa de área, con filtro opcional
    const correspondencias = await promette.rl_correspondencia_usuario_estado.findAll({
      include: [
        {
          model: promette.rl_usuario_puesto,
          as: "rl_usuario_puesto",
          include: [
            {
              model: promette.ct_puesto,
              as: "ct_puesto",
              attributes: ["ct_area_id"], // Solo necesitamos ct_area_id
            },
          ],
        },
        {
          model: promette.ct_correspondencia_estado,
          as: "ct_correspondencia_estado_ct_correspondencia_estado",
          attributes: ["id_correspondencia_estado"], // Incluir el estado
        },
      ],
      where: condiciones,
      order: [['createdAt', 'DESC']],
    });

    // Obtener la lista de áreas desde INFRAESTRUCTURA_API
    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API as string}/area`;
    const infraestructuraResponse = await axios.get(infraestructuraApiUrl);
    const areasExternas = infraestructuraResponse.data; // Lista de áreas con id_area y nombre

    // Crear un mapa para relacionar id_area con el nombre del área
    const areaMap = new Map();
    areasExternas.forEach((area: any) => {
      areaMap.set(area.id_area, area.nombre);
    });

    // Mapa para consolidar los totales por área
    const resumenPorArea = new Map<number, {
      nombre_area: string;
      total_correspondencias: number;
      resueltas: number;
      concluidas: number;
    }>();

    // Contar correspondencias por área
    correspondencias.forEach((corr: any) => {
      const areaId = corr.rl_usuario_puesto?.ct_puesto?.ct_area_id;
      if (!areaId) return;

      const areaNombre = areaMap.get(areaId) || 'Área no encontrada';

      if (!resumenPorArea.has(areaId)) {
        resumenPorArea.set(areaId, {
          nombre_area: areaNombre,
          total_correspondencias: 0,
          resueltas: 0,
          concluidas: 0,
        });
      }

      const areaData = resumenPorArea.get(areaId)!;
      areaData.total_correspondencias++;

      // Obtener el estado de la correspondencia
      const estado = corr.ct_correspondencia_estado_ct_correspondencia_estado?.id_correspondencia_estado;

      // Contar resueltas (estados 2, 3, 4, 6)
      if ([1,2, 3, 4, 6].includes(estado)) {
        areaData.resueltas++;
      }

      // Contar concluidas (estados 5, 6)
      if ([5, 6].includes(estado)) {
        areaData.concluidas++;
      }
    });

    // Convertir el mapa en un array de resultados
    const resultados = Array.from(resumenPorArea.values());

    // Filtrar áreas que tienen al menos una correspondencia
    const areasConCorrespondencias = resultados.filter(area => area.total_correspondencias > 0);

    return res.status(200).json({
      success: true,
      data: areasConCorrespondencias,
    });
  } catch (error) {
    console.error("Error al obtener resumen de correspondencia por área:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener resumen de correspondencia por área",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const editarCorrespondencia = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ message: "Error de conexión con la base de datos" });
    }

    const { 
      id_correspondencia,
      ct_usuarios_in, // Usuario que intenta editar (obligatorio)
      folio_correspondencia, 
      resumen_correspondencia,
      ct_clasificacion_prioridad_id,
      ct_forma_entrega_id,
      id_usuario_puesto,
      id_usuario_puesto_2
    } = req.body;

    const archivo = req.file;
    const errores: string[] = [];

    // Validaciones obligatorias
    if (!id_correspondencia) errores.push("El campo 'id_correspondencia' es obligatorio");
    if (!ct_usuarios_in) errores.push("El campo 'ct_usuarios_in' es obligatorio");

    if (errores.length > 0) {
      return res.status(400).json({ success: false, message: "Error de validación", errores });
    }

    // Obtener la correspondencia original
    const correspondencia = await promette.dt_correspondencia.findOne({
      where: { id_correspondencia }
    });

    if (!correspondencia) {
      return res.status(404).json({ success: false, message: "Correspondencia no encontrada" });
    }

    // --- Validación clave: ¿El usuario es el creador original? ---
    if (correspondencia.ct_usuarios_in !== Number(ct_usuarios_in)) {
      return res.status(403).json({ 
        success: false, 
        message: "Solo el creador de la correspondencia puede editarla" 
      });
    }

    // Resto de validaciones (estado = 1, etc.)
    const estadoActual = await promette.rl_correspondencia_usuario_estado.findOne({
      where: { dt_correspondencia_id: id_correspondencia },
      order: [['createdAt', 'DESC']],
    });

    if (!estadoActual || estadoActual.ct_correspondencia_estado !== 1) {
      return res.status(400).json({
        success: false,
        message: "No se puede editar una correspondencia con estado diferente a 1."
      });
    }

    // Variables para el nuevo folio
    let nuevoFolioSistema = correspondencia.folio_sistema;
    let actualizarFolio = false;

    // --- Actualizar remitente/destinatario en el folio_sistema ---
    if (id_usuario_puesto || id_usuario_puesto_2) {
      const partesFolio = correspondencia.folio_sistema.split('-');
      if (partesFolio.length !== 3) {
        return res.status(400).json({ 
          success: false, 
          message: "Formato de folio_sistema inválido" 
        });
      }

      // Obtener remitente y destinatario actualizados
      const nuevoRemitente = id_usuario_puesto 
        ? await obtenerRemitente(id_usuario_puesto) 
        : partesFolio[1]; // Mantener el existente

      const nuevoDestinatario = id_usuario_puesto_2 
        ? await obtenerRemitente(id_usuario_puesto_2) 
        : partesFolio[0]; // Mantener el existente

      // Construir nuevo folio (manteniendo el incremental original)
      nuevoFolioSistema = `${nuevoDestinatario}-${nuevoRemitente}-${partesFolio[2]}`;
      actualizarFolio = true;

      // Validar longitud del folio
      const LIMITE_FOLIO = 50; // Ajustar según tu esquema de BD
      if (nuevoFolioSistema.length > LIMITE_FOLIO) {
        return res.status(400).json({
          success: false,
          message: `El folio generado excede la longitud máxima permitida (${LIMITE_FOLIO} caracteres).`
        });
      }
    }

    // Resto de validaciones (puestos, prioridad, etc.)
    if (id_usuario_puesto) {
      const puestoExiste = await promette.rl_usuario_puesto.findOne({
        where: { id_usuario_puesto, estado: 1 }
      });
      if (!puestoExiste) {
        return res.status(400).json({ message: 'El puesto del remitente no existe o no está activo' });
      }
    }

    if (id_usuario_puesto_2) {
      const puestoDestinatarioExiste = await promette.rl_usuario_puesto.findOne({
        where: { id_usuario_puesto: id_usuario_puesto_2, estado: 1 }
      });
      if (!puestoDestinatarioExiste) {
        return res.status(400).json({ message: 'El puesto del destinatario no existe o no está activo' });
      }
    }

    // Campos a actualizar
    const camposActualizar: any = {
      ...(folio_correspondencia && { folio_correspondencia }),
      ...(resumen_correspondencia && { resumen_correspondencia }),
      ...(ct_clasificacion_prioridad_id && { ct_clasificacion_prioridad_id }),
      ...(ct_forma_entrega_id && { ct_forma_entrega_id }),
      ...(actualizarFolio && { folio_sistema: nuevoFolioSistema }), // Actualizar folio_sistema solo si hubo cambios
      ct_usuarios_at: ct_usuarios_in, // Guardar el editor en ct_usuarios_at
      updatedAt: new Date() // Actualizar automáticamente la fecha
    };

    // Manejo del archivo PDF (si se envía)
    if (archivo) {
      const rutaBase = process.env.UPLOAD_BASE_PATH 
        ? path.join(process.env.UPLOAD_BASE_PATH, "correspondenciaFile") 
        : 'correspondenciaFile';
      
      const nombreArchivo = `${correspondencia.folio_sistema}.pdf`;
      const rutaFinal = path.join(rutaBase, nombreArchivo);

      if (!fs.existsSync(rutaBase)) {
        fs.mkdirSync(rutaBase, { recursive: true });
      }

      // Validar que el archivo tenga buffer o path
      if (archivo.buffer) {
        fs.writeFileSync(rutaFinal, archivo.buffer);
      } else if (archivo.path) {
        fs.renameSync(archivo.path, rutaFinal);
      } else {
        throw new Error("El archivo no tiene buffer ni ruta temporal.");
      }

      camposActualizar.ruta_correspondencia = nombreArchivo;
    }

    // Actualizar la correspondencia
    await promette.dt_correspondencia.update(camposActualizar, {
      where: { id_correspondencia }
    });

    res.status(200).json({ 
      success: true,
      message: "Correspondencia actualizada correctamente",
      data: {
        id_correspondencia,
        editor: ct_usuarios_in, // Quién editó
        cambios: camposActualizar
      }
    });
  } catch (error) {
    console.error("Error al editar la correspondencia:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al editar la correspondencia",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};

export default router;