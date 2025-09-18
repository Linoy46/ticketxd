import { ct_municipio } from './../../models/modelsPromette/ct_municipio';
// import { ct_niveles_educativos } from './../../src/models/modelProdep/ct_niveles_educativos';
import { Request, Response, NextFunction } from "express";
import { promette } from '../../models/database.models'; // Importa los modelos
import path from 'path';
import fs from 'fs';
import { Op, where } from 'sequelize';
import multer from 'multer';
import generatePassword from 'generate-password';
import { register } from '../authController/auth.controller';
import { saveFiles } from "../../helpers/aneec.helper";
import { sendEmail } from "../../helpers/send.email.helper";
const PDFDocument = require("pdfkit"); //pdfkit para generar PDF
const fondoPath = path.resolve(__dirname, '../../public/fondoHoja.jpg'); //obetener la ruta del fondo de la hoja

//obtencion de modelos



// Configuración de Multer para manejar archivos y campos de texto
const upload = multer();

//verificar si los modelos se pueden usar correctamente
const modelsValidator = async (req: Request, res: Response,) => {
  if (!promette) {
    res.status(500).json({ message: "Error de conexión con la base de datos" });
    return;
  }

}


//METODOS DEL CONTROLADOR//

//metodo de control
export const accesoController = async (req: Request, res: Response,) => {

  res.status(200).json({ message: "ACCESO CORRECTO" });

}


//metodo de control para probar un json 
export const testDiagnosticos = async (req: Request, res: Response) => {
  // Multer procesa los archivos y campos de texto
  upload.none()(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error al procesar la solicitud", error: err.message });
    }

    const { diagnosticos: diagnosticosString } = req.body;

    console.log(req.body); // Verifica si el campo diagnosticos está presente

    try {
      // Parsear el campo diagnosticos como un arreglo JSON
      let diagnosticos: any[] = [];
      try {
        diagnosticos = JSON.parse(diagnosticosString);
      } catch (error) {
        return res.status(400).json({ success: false, message: "El campo 'diagnosticos' no es un JSON válido." });
      }

      // Devolver el contenido de diagnosticos en un JSON
      res.status(200).json({ success: true, diagnosticos });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error en la prueba de diagnosticos", error: error instanceof Error ? error.message : String(error) });
    }
  });
};


// Lista de campos de archivos para la creación o actualización  de aspirantes y diagnósticos
const fileFields = [
  'ruta_ine',
  'ruta_comprobante_estudio',
  'ruta_comprobante_domicilio_facilitador',
  'ruta_carta_compromiso',
  'ruta_aviso_privacidad_aspirante',
  'ruta_diagnostico',
  'ruta_INE_tutor',
  'ruta_acta_nacimiento_usuario',
  'ruta_comprobante_domicilio_diagnosticado',
  'ruta_privacidad_usuario',
  'ruta_carta_compromiso_usuario'
];

// Función para eliminar archivos subidos
const deleteUploadedFiles = (files: { [fieldname: string]: Express.Multer.File[] }) => {
  for (const field of fileFields) {
    if (files[field]) {
      // Si el campo es 'ruta_diagnostico', puede tener múltiples archivos
      if (field === 'ruta_diagnostico') {
        for (const file of files[field]) {
          if (fs.existsSync(file.path)) { // Verificar si el archivo existe
            fs.unlinkSync(file.path); // Eliminar archivo subido
          }
        }
      } else if (files[field][0]) {
        // Para otros campos, solo eliminar el primer archivo
        if (fs.existsSync(files[field][0].path)) { // Verificar si el archivo existe
          fs.unlinkSync(files[field][0].path); // Eliminar archivo subido
        }
      }
    }
  }
};

//crear nuevo aspirante 
export const createApplicantAneec = async (req: Request, res: Response) => {
  const {
    // Campos necesarios para crear nuevo aspirante en dt_aspirante_aneec
    curp, nombre, apellido_paterno, apellido_materno, correo, fecha_nacimiento, instituto,
    licenciatura, direccion, codigo_postal, ct_municipio_id, localidad, status, tipo_documento, telefono, ct_usuario_in,

    // Campo para crear diagnósticos en dt_diagnostico_aneec (ahora como un arreglo porque puede ser mas de un diagnóstico)
    diagnosticos: diagnosticosCliente // diagnosticos es una cadena JSON
  } = req.body;

  // Obtener los archivos subidos
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  try {
    modelsValidator(req, res);

    // Parsear el campo diagnosticos como un arreglo JSON
    let diagnosticos: any[] = [];

    // Solo intentar parsear si la licenciatura no es "CRI" o si se proporcionaron diagnósticos
    if (licenciatura !== "CRI" || diagnosticosCliente) {
      try {
        diagnosticos = JSON.parse(diagnosticosCliente);
      } catch (error) {
        // Eliminar archivos subidos si el JSON no es válido
        deleteUploadedFiles(files);
        return res.status(400).json({ success: false, message: "El campo 'diagnosticos' no es un JSON válido." });
      }
    }

    // Verificar si la CURP ya existe en la base de datos
    const existingApplicant = await promette.dt_aspirante_aneec.findOne({ where: { curp } });
    if (existingApplicant) {
      // Eliminar archivos subidos si la CURP ya existe
      deleteUploadedFiles(files);
      return res.status(400).json({ success: false, message: "La CURP ya está registrada" });
    }

    // Verificar si hay diagnósticos para validar (ya sea CRI u otra licenciatura)
    if (diagnosticos && diagnosticos.length > 0) {
      // Verificar si los diagnósticos no exceden el límite de 2
      if (diagnosticos.length > 2) {
        // Eliminar archivos subidos si los diagnósticos no son válidos
        deleteUploadedFiles(files);
        return res.status(400).json({ success: false, message: "No se puede exceder el límite de dos diagnósticos." });
      }

      // Verificar si las CURPs de los diagnósticos ya existen en la tabla dt_diagnostico_aneec
      for (const diagnostico of diagnosticos) {
        const existingDiagnostic = await promette.dt_diagnostico_aneec.findOne({ where: { curp: diagnostico.curp_usuario } });
        if (existingDiagnostic) {
          // Eliminar archivos subidos si la CURP ya existe
          deleteUploadedFiles(files);
          return res.status(400).json({ success: false, message: `La CURP ${diagnostico.curp_usuario} ya está registrada como usuario diagnosticado` });
        }
      }
    }

    // Verificar si todos los archivos fueron subidos, excepto los archivos de diagnósticos si la licenciatura es "CRI"
    for (const field of fileFields) {
      if (licenciatura === "CRI" && [
        "ruta_diagnostico",
        "ruta_INE_tutor",
        "ruta_acta_nacimiento_usuario",
        "ruta_comprobante_domicilio_diagnosticado",
        "ruta_privacidad_usuario",
        "ruta_carta_compromiso_usuario"
      ].includes(field)) {
        continue; // Saltar la validación de archivos de diagnósticos si la licenciatura es "CRI"
      }
      if (!files[field] || files[field].length === 0) {
        // Eliminar archivos subidos si están incompletos
        deleteUploadedFiles(files);
        return res.status(400).json({ success: false, message: `El archivo ${field} es requerido.` });
      }
    }

    // Si todos los archivos se guardaron correctamente, se hacen las inserciónes del registro en la base de datos, primero en la tabla dt_aspirante_aneec
    const savedFiles = await saveFiles(files, `${process.env.UPLOAD_BASE_PATH}/documentsAneec`);

    const newApplicant = await promette.dt_aspirante_aneec.create({
      curp, nombre, apellido_paterno, apellido_materno, correo,
      fecha_nacimiento, instituto, licenciatura, direccion, codigo_postal,
      ct_municipio_id, localidad, status, tipo_documento, telefono,
      ruta_ine: savedFiles['ruta_ine'][0].filename,
      ruta_comprobante_estudio: savedFiles['ruta_comprobante_estudio'][0].filename,
      ruta_comprobante_domicilio: savedFiles['ruta_comprobante_domicilio_facilitador'][0].filename,
      ruta_carta_compromiso: savedFiles['ruta_carta_compromiso'][0].filename,
      ruta_aviso_privacidad_aspirante: savedFiles['ruta_aviso_privacidad_aspirante'][0].filename,
      ruta_privacidad_usuario: savedFiles['ruta_privacidad_usuario'] ? savedFiles['ruta_privacidad_usuario'][0].filename : null,
      ct_usuario_in
    });

    // Insertar los diagnósticos en la tabla dt_diagnostico_aneec solo si la licenciatura no es "CRI" o si se proporcionaron diagnósticos
    if (licenciatura !== "CRI" || (diagnosticos && diagnosticos.length > 0)) {
      for (let i = 0; i < diagnosticos.length; i++) {
        const diagnostico = diagnosticos[i];
        await promette.dt_diagnostico_aneec.create({
          curp: diagnostico.curp_usuario,
          nombreCompleto: diagnostico.nombre_completoUsuario,
          ct_municipio_id: diagnostico.ct_municipio_id_usuario,
          tipo_necesidad: diagnostico.tipo_necesidad,
          rehabilitacion_fisica: diagnostico.rehabilitacion_fisica,
          ruta_diagnostico: savedFiles['ruta_diagnostico'] ? savedFiles['ruta_diagnostico'][i].filename : null, 
          ruta_INE_tutor: savedFiles['ruta_INE_tutor'] ? savedFiles['ruta_INE_tutor'][i].filename : null, 
          ruta_acta_nacimiento_usuario: savedFiles['ruta_acta_nacimiento_usuario'] ? savedFiles['ruta_acta_nacimiento_usuario'][i].filename : null, 
          ruta_comprobante_domicilio: savedFiles['ruta_comprobante_domicilio_diagnosticado'] ? savedFiles['ruta_comprobante_domicilio_diagnosticado'][i].filename : null, 
          ruta_privacidad_usuario: savedFiles['ruta_privacidad_usuario'] ? savedFiles['ruta_privacidad_usuario'][i].filename : null, 
          ruta_carta_compromiso_usuario: savedFiles['ruta_carta_compromiso_usuario'] ? savedFiles['ruta_carta_compromiso_usuario'][i].filename : null, 
          dt_aspirante_id: newApplicant.id_aspirante,
          ct_usuario_in
        });
      }
    }

    // Obtener los diagnósticos asociados al aspirante
    const diagnosticosAsociados = await promette.dt_diagnostico_aneec.findAll({
      where: { dt_aspirante_id: newApplicant.id_aspirante }
    });

    //consulta municipio para mostrar en el pdf
    const municipio = await promette.ct_municipio.findByPk(ct_municipio_id);
    console.log(municipio.municipio);

    // INICIA PDF
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="REGISTRO.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.image(fondoPath, 0, 0, {
      width: 595.28,
      height: 841.89
    });

    // Función para hacer rectángulo con borde redondeado
    function roundedRect(doc: any, x: number, y: number, width: number, height: number, radius: number) {
      doc.moveTo(x + radius, y)
        .lineTo(x + width - radius, y)
        .quadraticCurveTo(x + width, y, x + width, y + radius)
        .lineTo(x + width, y + height - radius)
        .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        .lineTo(x + radius, y + height)
        .quadraticCurveTo(x, y + height, x, y + height - radius)
        .lineTo(x, y + radius)
        .quadraticCurveTo(x, y, x + radius, y)
        .closePath();
      return doc;
    }

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#58246c').text('REGISTRO DE FACILITADOR', doc.x, doc.y + 80, { align: 'center' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 160, 515, 190, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DATOS PERSONALES', doc.x, doc.y + 15, { align: 'center' });
    doc.fontSize(11).fillColor('black').text(`Nombre: ${nombre.toUpperCase()} ${apellido_paterno.toUpperCase()} ${apellido_materno.toUpperCase()}`, 55, 195, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Curp: ${curp.toUpperCase()}`, 55, 220, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Telefono: ${telefono}`, 55, 245, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Correo: ${correo}`, 55, 270, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Universidad: ${instituto.toUpperCase()}`, 55, 295, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Carrera: ${licenciatura.toUpperCase()}`, 55, 320, { align: 'left' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 370, 515, 115, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DIRECCIÓN DEL FACILITADOR', doc.x, 380, { align: 'center' });
    doc.fontSize(11).fillColor('black').text(`Municipio: ${municipio.municipio}`, 55, 405, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Localidad: ${localidad.toUpperCase()}`, 55, 430, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Dirección: ${direccion.toUpperCase()}`, 55, 455, { align: 'left' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 505, 515, 100, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('REPOSITORIO DOCUMENTAL', doc.x, 515, { align: 'center' });
    doc.fontSize(10).fillColor('black').text(`INE`, 75, 540, { width: 120, align: 'left' });
    doc.text(`Comprobante de domicilio`, 195, 540, { width: 120, align: 'left' });
    doc.text(`Comprobante de estudios`, 315, 540, { width: 120, align: 'left' });
    doc.text(`Carta Compromiso Facilitador`, 435, 540, { width: 120, align: 'left' });
    doc.lineWidth(0.5).rect(55, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 57, 541);
    doc.rect(175, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 177, 541);
    doc.rect(295, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 297, 541);
    doc.rect(415, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 417, 541);
    doc.fontSize(10).fillColor('black').text(`Aviso de Privacidad Facilitador`, 75, 575, { width: 120, align: 'left' });
    doc.text(`Carta Compromiso Usuario`, 195, 575, { width: 120, align: 'left' });
    doc.text(`Aviso de Privacidad Usuario`, 315, 575, { width: 120, align: 'left' });
    doc.lineWidth(0.5).rect(55, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 57, 576);
    doc.rect(175, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 177, 576);
    doc.rect(295, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 297, 576);
    doc.lineWidth(0.5);

    // Solo mostrar la sección de diagnósticos si la licenciatura no es "CRI" o si se proporcionaron diagnósticos
    if (licenciatura !== "CRI" || (diagnosticos && diagnosticos.length > 0)) {
      roundedRect(doc, 40, 625, 515, 100, 5).fillAndStroke('white', 'black');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DIAGNÓSTICO', 50, 640, { align: 'center' });
      doc.fontSize(11).fillColor('black').text(`Curp: ${diagnosticos[0].curp_usuario.toUpperCase()}`, 55, 660, { width: 240, align: 'left' });
      doc.text(`Nombre: ${diagnosticos[0].nombre_completoUsuario.toUpperCase()}`, 55, 680, { width: 240, align: 'left' });
      doc.text(`Necesidad: ${diagnosticos[0].tipo_necesidad.toUpperCase()}`, 55, 700, { width: 240, align: 'left' });
      if (diagnosticos.length == 2) { // 2 diagnósticos
        doc.fontSize(11).fillColor('black').text(`Curp: ${diagnosticos[1].curp_usuario.toUpperCase()}`, 310, 660, { width: 240, align: 'left' });
        doc.text(`Nombre: ${diagnosticos[1].nombre_completoUsuario.toUpperCase()}`, 310, 680, { width: 240, align: 'left' });
        doc.text(`Necesidad: ${diagnosticos[1].tipo_necesidad.toUpperCase()}`, 310, 700, { width: 240, align: 'left' });
      }
    }

    doc.pipe(res);
    doc.end();
  } catch (error) {
    // Eliminar archivos subidos en caso de error
    deleteUploadedFiles(files);
    res.status(500).json({
      success: false,
      message: "Error al crear el registro...",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};


// Método para cambiar el estado de un aspirante
export const changeApplicantState = async (req: Request, res: Response) => {
  try {
    // Verificar si los modelos están disponibles
    modelsValidator(req, res);

    // Obtener el id_aspirante y el nuevo estado del cuerpo de la solicitud
    const { id_aspirante, status } = req.body;

    // Verificar si el id_aspirante y el estado están presentes
    if (!id_aspirante || !status) {
      return res.status(400).json({ success: false, message: "Los campos 'id_aspirante' y 'status' son requeridos." });
    }

    // Buscar el aspirante por su id_aspirante
    const applicanteAneec = await promette.dt_aspirante_aneec.findByPk(id_aspirante);

    // Verificar si el aspirante existe
    if (!applicanteAneec) {
      return res.status(404).json({ success: false, message: "Aspirante no encontrado" });
    }

    // Si el estado es "VALIDADO", crear un usuario y contraseña
    if (status === "VALIDADO") {
      const nombre = applicanteAneec.nombre;
      const apellidoPaterno = applicanteAneec.apellido_paterno;
      const apellidoMaterno = applicanteAneec.apellido_materno;

      // Crear el usuario: primera letra del nombre + apellido paterno + primera letra del apellido materno
      let usuarioBase = `${nombre.charAt(0)}${apellidoPaterno}${apellidoMaterno.charAt(0)}`.toLocaleLowerCase();
      let usuario = usuarioBase;
      let existingUser;

      // Bucle para asegurar que el usuario sea único
      do {
        // Verificar si el usuario ya existe en la tabla ct_usuario
        existingUser = await promette.ct_usuario.findOne({ where: { nombre_usuario: usuario } });
        if (existingUser) {
          // Si el usuario ya existe, agregar 4 números aleatorios al final
          usuario = `${usuarioBase}${Math.floor(1000 + Math.random() * 9000)}`;
        }
      } while (existingUser); // Continuar hasta que el usuario sea único

      // Generar la contraseña con la librería generate-password
      const contrasena = generatePassword.generate({
        length: 10,
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true,
      });

      // Crear un objeto Request simulado para poder usar el metodo register del controlador de usuarios authController
      const registerRequest = {
        body: {
          nombre_usuario: usuario,
          contrasena: contrasena,
          telefono: applicanteAneec.telefono,
          curp: applicanteAneec.curp,
          email: applicanteAneec.correo,
          email_institucional: "",
          portal_name: "ANEEC",
          email_template: "welcomeExternal.html",
          email_subject: "Bienvenido a ANEEC",
        }
      } as Request;

      // Crear un objeto Response simulado para capturar la respuesta de register
      const mockResponse = {
        statusCode: 200,
        jsonData: null,
        status: function (code: number) {
          this.statusCode = code;
          return this;
        },
        json: function (data: any) {
          this.jsonData = data;
          return this;
        }
      } as any;

      try {
        // Llamar al método register usando el Response simulado
        await register(registerRequest, mockResponse);

        // Verificar si el registro fue exitoso
        if (mockResponse.statusCode !== 200) {
          return res.status(mockResponse.statusCode).json(mockResponse.jsonData);
        }

        // Obtener el ID del puesto "Estudiante ANEEC"
        const puestoEstudianteANEEC = await promette.ct_puesto.findOne({
          where: { nombre_puesto: "Estudiante ANEEC" }
        });

        if (!puestoEstudianteANEEC) {
          return res.status(404).json({ success: false, message: "Puesto 'Estudiante ANEEC' no encontrado" });
        }

        // Obtener el ID del usuario recién creado
        const nuevoUsuario = await promette.ct_usuario.findOne({
          where: { nombre_usuario: usuario }
        });

        if (!nuevoUsuario) {
          return res.status(404).json({ success: false, message: "Usuario no encontrado después de la creación" });
        }

        // Obtener la fecha actual en formato YYYY-MM-DD 00:00:00
        const fechaActual = new Date();
        const periodoInicio = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')} 00:00:00`;

        // Asociar el usuario con el puesto en la tabla rl_usuario_puesto
        await promette.rl_usuario_puesto.create({
          ct_usuario_id: nuevoUsuario.id_usuario,
          ct_puesto_id: puestoEstudianteANEEC.id_puesto,
          periodo_inicio: periodoInicio,
          estado: 1,
          ct_usuario_in: 1
        });

        // Si el registro fue exitoso, actualizar el estado del aspirante
        await applicanteAneec.update({ status });

        // Enviar la respuesta combinada con el usuario, la contraseña y la respuesta de register
        res.status(200).json({
          success: true,
          message: `Facilitador validado correctamente. Usuario: ${usuario}, Contraseña: ${contrasena}`,
          usuario,
          contrasena,
          registerResponse: mockResponse.jsonData // Incluir la respuesta de register
        });
      } catch (error) {
        // Si register falla, no actualizar el estado del aspirante
        return res.status(500).json({ success: false, message: "Error al registrar el usuario", error: error instanceof Error ? error.message : String(error) });
      }
    } else {
      // Si el estado no es "VALIDADO", actualizar el estado directamente
      await applicanteAneec.update({ status });

      // Devolver el registro actualizado
      res.status(200).json({ success: true, message: "Facilitador descartado correctamente" });
    }
  } catch (error) {
    // Manejar errores
    res.status(500).json({ success: false, message: "Error al actualizar el estado del aspirante", error: error instanceof Error ? error.message : String(error) });
  }
};

// Método para obtener todos los diagnósticos
export const getAllADiagnostics = async (req: Request, res: Response) => {
  try {
    // Verifica si los modelos están disponibles
    modelsValidator(req, res);

    // Obtener todos los diagnósticos con un join a dt_aspirante_aneec
    const diagnoses = await promette.dt_diagnostico_aneec.findAll({
      include: [
        {
          model: promette.dt_aspirante_aneec,
          as: 'dt_aspirante', // Alias de la relación
          attributes: ['nombre', 'apellido_paterno', 'apellido_materno'] // Seleccionar los campos del facilitador
        }
      ]
    });

    // Devolver los registros encontrados
    res.status(200).json({ success: true, diagnosticos: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los diagnósticos", error: error instanceof Error ? error.message : String(error) });
  }
};



// Método para obtener todos los aspirantes con sus diagnósticos
export const getAllApplicantsWithDiagnostics = async (req: Request, res: Response) => {
  try {
    // Verifica si los modelos están disponibles
    modelsValidator(req, res);

    // Obtener todos los aspirantes con sus diagnósticos asociados
    const applicants = await promette.dt_aspirante_aneec.findAll({
      include: [
        {
          model: promette.dt_diagnostico_aneec, // Incluir la tabla de diagnósticos
          as: 'dt_diagnostico_aneecs', // Alias de la relación 
        },
      ],
    });

    // Devolver los registros encontrados
    res.status(200).json({ success: true, applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los aspirantes con diagnósticos", error: error instanceof Error ? error.message : String(error) });
  }
};





//obtener la lista de aspirantes
export const getAllApplicantsAneec = async (req: Request, res: Response) => {
  try {
    // Verifica si los modelos están disponibles
    modelsValidator(req, res);

    // Obtiene todos los registros de la tabla dt_aspirante_aneec
    const applicants = await promette.dt_aspirante_aneec.findAll();

    // Devuelve los registros encontrados
    res.status(200).json({ success: true, applicants: applicants });
  } catch (error) {

    res.status(500).json({ success: false, message: "Error al obtener los aspirantes" });
  }
};

//Obtener municipios de la base de datos
export const getAllMunicipalities = async (req: Request, res: Response) => {
  try {
    //verificar si los moelos estan disponibles 
    modelsValidator(req, res)

    const municipalities = await promette.ct_municipio.findAll();

    //devolvemos los registros (municipios)
    res.status(200).json({ success: true, municipios: municipalities })

  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los municipios" });
  }
}




//Metodo para obtener un documento en esfecifio de un aspirante 
export const getSpecificDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileRoute } = req.params;

    modelsValidator(req, res);

    const rutaInfografia = fileRoute;
    const uploadBasePath = `${process.env.UPLOAD_BASE_PATH}/documentsAneec/` || '';

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


// Método para buscar un usuario por id en ct_usuario y luego buscar en dt_aspirante_aneec por CURP
export const getApplicantByUserId = async (req: Request, res: Response) => {
  const { id_usuario } = req.params;

  try {
    // Verificar si los modelos están disponibles
    modelsValidator(req, res);

    // Buscar el usuario por id en la tabla ct_usuario
    const usuario = await promette.ct_usuario.findByPk(id_usuario);

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Obtener la CURP del usuario
    const curp = usuario.curp;

    if (!curp) {
      return res.status(400).json({ success: false, message: "El usuario no tiene una CURP asociada" });
    }

    // Buscar el aspirante por CURP en la tabla dt_aspirante_aneec
    const aspirante = await promette.dt_aspirante_aneec.findOne({
      where: { curp },
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico_aneecs',
        },
      ],
    });

    if (!aspirante) {
      return res.status(404).json({ success: false, message: "Aspirante no encontrado con la CURP proporcionada" });
    }

    // Devolver los datos del aspirante
    res.status(200).json({ success: true, applicants: aspirante });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener los datos del aspirante", error: error instanceof Error ? error.message : String(error) });
  }
};



// Método para cambiar el estado de un aspirante y simular el envío de correo
export const changeApplicantStateWithEmail = async (req: Request, res: Response) => {
  const { id_aspirante, status, id_usuario } = req.body;

  try {
    // Verificar si los modelos están disponibles
    modelsValidator(req, res);

    // Verificar si el id_aspirante, el estado y el id_usuario están presentes
    if (!id_aspirante || !status || !id_usuario) {
      return res.status(400).json({ success: false, message: "Los campos 'id_aspirante', 'status' y 'id_usuario' son requeridos." });
    } 

    // Buscar el aspirante por su id_aspirante
    const aspirante = await promette.dt_aspirante_aneec.findByPk(id_aspirante);

    // Verificar si el aspirante existe
    if (!aspirante) {
      return res.status(404).json({ success: false, message: "Aspirante no encontrado" });
    }

    // Enviar correo dependiendo del estado
    if (status === "VALIDADO" || status === "RECHAZADO") {
      const emailTemplate = status === "VALIDADO" ? "acceptanceAneecEmail.html" : "rejectionAneecEmail.html";
      const emailSubject = status === "VALIDADO" ? "Bienvenido a ANEEC" : "Resultado de la solicitud al programa ANEEC";

      const htmlFilePath = path.join(__dirname, "..", "..", "mails", emailTemplate);
      let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

      // Reemplazar marcadores de posición en el HTML
      htmlContent = htmlContent
        .replace("{{nombre}}", aspirante.nombre)
        .replace("{{apellido_paterno}}", aspirante.apellido_paterno)
        .replace("{{apellido_materno}}", aspirante.apellido_materno);

      try {
        // Enviar el correo
        await sendEmail(
          process.env.EMAIL_ADDRESS || "",
          process.env.EMAIL_PASSWORD || "",
          aspirante.correo,
          htmlContent,
          emailSubject
        );

        // Si el correo se envió correctamente, actualizar el estado del aspirante y el campo ct_usuario_at
        await aspirante.update({ status, ct_usuario_at: id_usuario });

        res.status(200).json({ success: true, message: `Estado actualizado a ${status} y correo enviado.` });
      } catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).json({ success: false, message: "Error al enviar el correo, el estado no se actualizó", error: error instanceof Error ? error.message : String(error) });
      }
    } else {
      // Si el estado no es ni "VALIDADO" ni "RECHAZADO", actualizar el estado y el campo ct_usuario_at directamente
      await aspirante.update({ status, ct_usuario_at: id_usuario });
      res.status(200).json({ success: true, message: "Estado actualizado, pero no se envió ningún correo." });
    }
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({ success: false, message: "Error al procesar la solicitud", error: error instanceof Error ? error.message : String(error) });
  }
};


//metodo para obtener la informacion de un facilitador autorizado
export const getAuthorizedFacilitator = async (req: Request, res: Response) => {
  const { curp } = req.params;
  try {

    //Verificar si los modelos estan disponibles
    modelsValidator(req, res);

    //validar el estatus del facilitador 
    if (!curp) { res.status(400).json({ succes: false, message: "El campo curp es requerido" }) };

    const facilitador = await promette.dt_aspirante_aneec.findOne({
      where: { curp },
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico_aneecs',
        },
      ],
    });

    //validar si el facilitador existe
    if (!facilitador) { return res.status(404).json({ success: false, message: "No se encontró el facilitador" }) };

    if (facilitador.status !== "VALIDADO") {
      return res.status(400).json({ success: false, message: "Facilitador no autorizado para subir archivos" });
    } else {
      return res.status(200).json({ succes: true, message: "Facilitador autorizado", facilitador });
    }

  } catch (error) {
    res.status(500).json({ succes: false, message: "Ocurrio un error inesperado", error: error instanceof Error ? error.message : String(error) });
  }
}





// Método para reimprimir el comprobante de registro de un facilitador
export const reprintApplicantReceipt = async (req: Request, res: Response) => {
  const { curp } = req.params;

  try {
    // Verificar si los modelos están disponibles
    modelsValidator(req, res);

    // Buscar el aspirante por CURP
    const aspirante = await promette.dt_aspirante_aneec.findOne({
      where: { curp },
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico_aneecs',
        },
      ],
    });

    if (!aspirante) {
      return res.status(404).json({ success: false, message: "Facilitador no encontrado" });
    }

    // Obtener el municipio
    const municipio = await promette.ct_municipio.findByPk(aspirante.ct_municipio_id);

    // INICIA PDF
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="COMPROBANTE_REGISTRO.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.image(fondoPath, 0, 0, {
      width: 595.28,
      height: 841.89
    });

    // Función para hacer rectángulo con borde redondeado
    function roundedRect(doc: any, x: number, y: number, width: number, height: number, radius: number) {
      doc.moveTo(x + radius, y)
        .lineTo(x + width - radius, y)
        .quadraticCurveTo(x + width, y, x + width, y + radius)
        .lineTo(x + width, y + height - radius)
        .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        .lineTo(x + radius, y + height)
        .quadraticCurveTo(x, y + height, x, y + height - radius)
        .lineTo(x, y + radius)
        .quadraticCurveTo(x, y, x + radius, y)
        .closePath();
      return doc;
    }

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#58246c').text('REGISTRO DE FACILITADOR', doc.x, doc.y + 80, { align: 'center' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 160, 515, 190, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DATOS PERSONALES', doc.x, doc.y + 15, { align: 'center' });
    doc.fontSize(11).fillColor('black').text(`Nombre: ${aspirante.nombre.toUpperCase()} ${aspirante.apellido_paterno.toUpperCase()} ${aspirante.apellido_materno.toUpperCase()}`, 55, 195, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Curp: ${aspirante.curp.toUpperCase()}`, 55, 220, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Telefono: ${aspirante.telefono}`, 55, 245, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Correo: ${aspirante.correo}`, 55, 270, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Universidad: ${aspirante.instituto.toUpperCase()}`, 55, 295, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Carrera: ${aspirante.licenciatura.toUpperCase()}`, 55, 320, { align: 'left' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 370, 515, 115, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DIRECCIÓN DEL FACILITADOR', doc.x, 380, { align: 'center' });
    doc.fontSize(11).fillColor('black').text(`Municipio: ${municipio.municipio}`, 55, 405, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Localidad: ${aspirante.localidad.toUpperCase()}`, 55, 430, { align: 'left' });
    doc.fontSize(11).fillColor('black').text(`Dirección: ${aspirante.direccion.toUpperCase()}`, 55, 455, { align: 'left' });
    doc.lineWidth(0.5);
    roundedRect(doc, 40, 505, 515, 100, 5).fillAndStroke('white', 'black');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('REPOSITORIO DOCUMENTAL', doc.x, 515, { align: 'center' });
    doc.fontSize(10).fillColor('black').text(`INE`, 75, 540, { width: 120, align: 'left' });
    doc.text(`Comprobante de domicilio`, 195, 540, { width: 120, align: 'left' });
    doc.text(`Comprobante de estudios`, 315, 540, { width: 120, align: 'left' });
    doc.text(`Carta Compromiso Facilitador`, 435, 540, { width: 120, align: 'left' });
    doc.lineWidth(0.5).rect(55, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 57, 541);
    doc.rect(175, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 177, 541);
    doc.rect(295, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 297, 541);
    doc.rect(415, 540, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 417, 541);
    doc.fontSize(10).fillColor('black').text(`Aviso de Privacidad Facilitador`, 75, 575, { width: 120, align: 'left' });
    doc.text(`Carta Compromiso Usuario`, 195, 575, { width: 120, align: 'left' });
    doc.text(`Aviso de Privacidad Usuario`, 315, 575, { width: 120, align: 'left' });
    doc.lineWidth(0.5).rect(55, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 57, 576);
    doc.rect(175, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 177, 576);
    doc.rect(295, 575, 10, 10).fillAndStroke('white', 'black').fillColor('black').text('X', 297, 576);
    doc.lineWidth(0.5);

    // Solo mostrar la sección de diagnósticos si la licenciatura no es "CRI" o si hay diagnósticos
    if (aspirante.licenciatura !== "CRI" || (aspirante.dt_diagnostico_aneecs && aspirante.dt_diagnostico_aneecs.length > 0)) {
      roundedRect(doc, 40, 625, 515, 100, 5).fillAndStroke('white', 'black');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#921f26').text('DIAGNÓSTICO', 50, 640, { align: 'center' });
      
      if (aspirante.dt_diagnostico_aneecs && aspirante.dt_diagnostico_aneecs.length > 0) {
        const diagnostico1 = aspirante.dt_diagnostico_aneecs[0];
        doc.fontSize(11).fillColor('black').text(`Curp: ${diagnostico1.curp.toUpperCase()}`, 55, 660, { width: 240, align: 'left' });
        doc.text(`Nombre: ${diagnostico1.nombreCompleto.toUpperCase()}`, 55, 680, { width: 240, align: 'left' });
        doc.text(`Necesidad: ${diagnostico1.tipo_necesidad.toUpperCase()}`, 55, 700, { width: 240, align: 'left' });

        if (aspirante.dt_diagnostico_aneecs.length > 1) {
          const diagnostico2 = aspirante.dt_diagnostico_aneecs[1];
          doc.fontSize(11).fillColor('black').text(`Curp: ${diagnostico2.curp.toUpperCase()}`, 310, 660, { width: 240, align: 'left' });
          doc.text(`Nombre: ${diagnostico2.nombreCompleto.toUpperCase()}`, 310, 680, { width: 240, align: 'left' });
          doc.text(`Necesidad: ${diagnostico2.tipo_necesidad.toUpperCase()}`, 310, 700, { width: 240, align: 'left' });
        }
      }
    }

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el comprobante de registro...",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Método para obtener un informe específico del facilitador
export const getSpecificReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileRoute } = req.params;

    modelsValidator(req, res);

    const rutaInforme = fileRoute;
    const uploadBasePath = `${process.env.UPLOAD_BASE_PATH}/InformesAneec/` || '';

    const rutaCompleta = path.join(uploadBasePath, rutaInforme);

    // Verificar si el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      res.status(404).json({ success: false, message: "Informe no encontrado" });
      return;
    }

    // Enviar el archivo como respuesta
    res.sendFile(rutaCompleta);
  } catch (error) {
    //console.error("Error al obtener el informe:", error);
    res.status(400).json({
      success: false,
      message: "Reporte no encontrado.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Método para obtener una planeación específica del facilitador
export const getSpecificPlanning = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileRoute } = req.params;

    modelsValidator(req, res);

    const rutaPlaneacion = fileRoute;
    const uploadBasePath = `${process.env.UPLOAD_BASE_PATH}/PlaneacionesAneec/` || '';

    const rutaCompleta = path.join(uploadBasePath, rutaPlaneacion);

    // Verificar si el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      res.status(404).json({ success: false, message: "Planeación no encontrada" });
      return;
    }

    // Enviar el archivo como respuesta
    res.sendFile(rutaCompleta);
  } catch (error) {
    //console.error("Error al obtener la planeación:", error);
    res.status(400).json({
      success: false,
      message: "Planeación no encontrada.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Método para obtener todos los informes y diagnosticos asociados a cada facilitador
export const getAllReports = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Buscar todos los informes con un join a dt_diagnostico_aneec y dt_aspirante_aneec
    const informes = await promette.dt_informes_aneec.findAll({
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico',
          attributes: ['nombreCompleto', 'curp', 'tipo_necesidad', 'rehabilitacion_fisica']
        },
        {
          model: promette.dt_aspirante_aneec,
          as: 'dt_aspirante',
          attributes: ['id_aspirante', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp']
        }
      ]
    });

    // Verificar si se encontraron informes
    if (!informes || informes.length === 0) {
      return res.status(404).json({ success: false, message: "No se encontraron informes" });
    }

    // Agrupar los informes por facilitador
    const informesAgrupados = informes.reduce((acc: any, informe: any) => {
      const facilitadorId = informe.dt_aspirante_id;

      // Si el facilitador no está en el acumulador, lo agregamos
      if (!acc[facilitadorId]) {
        acc[facilitadorId] = {
          facilitador: {
            id_aspirante: informe.dt_aspirante.id_aspirante,
            nombre: informe.dt_aspirante.nombre,
            apellido_paterno: informe.dt_aspirante.apellido_paterno,
            apellido_materno: informe.dt_aspirante.apellido_materno,
            curp: informe.dt_aspirante.curp
          },
          informes: []
        };
      }

      // Agregar el informe al arreglo de informes del facilitador
      acc[facilitadorId].informes.push({
        id_informe: informe.id_informe,
        ruta_informe: informe.ruta_informe,
        dt_diagnostico_id: informe.dt_diagnostico_id,
        ct_usuario_in: informe.ct_usuario_in,
        ct_usuario_at: informe.ct_usuario_at,
        createdAt: informe.createdAt,
        updatedAt: informe.updatedAt,
        dt_diagnostico: informe.dt_diagnostico
      });

      return acc;
    }, {});

    // Convertir el objeto de informes agrupados a un arreglo
    const resultado = Object.values(informesAgrupados);

    return res.status(200).json({
      success: true,
      message: "Informes obtenidos exitosamente",
      informes: resultado
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

// Método para obtener todas las planeaciones asociadas a cada facilitador
export const getAllPlannings = async (req: Request, res: Response) => {
  try {
    if (!promette) {
      return res.status(500).json({ success: false, message: "Error de conexión con la base de datos" });
    }

    // Buscar todas las planeaciones con un join a dt_diagnostico_aneec y dt_aspirante_aneec
    const planeaciones = await promette.dt_planeaciones_aneec.findAll({
      include: [
        {
          model: promette.dt_diagnostico_aneec,
          as: 'dt_diagnostico',
          attributes: ['nombreCompleto', 'curp', 'tipo_necesidad', 'rehabilitacion_fisica']
        },
        {
          model: promette.dt_aspirante_aneec,
          as: 'dt_aspirante',
          attributes: ['id_aspirante', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp']
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
      return res.status(404).json({ success: false, message: "No se encontraron planeaciones" });
    }

    // Agrupar las planeaciones por facilitador
    const planeacionesAgrupadas = planeaciones.reduce((acc: any, planeacion: any) => {
      const facilitadorId = planeacion.dt_aspirante_id;

      // Si el facilitador no está en el acumulador, lo agregamos
      if (!acc[facilitadorId]) {
        acc[facilitadorId] = {
          facilitador: {
            id_aspirante: planeacion.dt_aspirante.id_aspirante,
            nombre: planeacion.dt_aspirante.nombre,
            apellido_paterno: planeacion.dt_aspirante.apellido_paterno,
            apellido_materno: planeacion.dt_aspirante.apellido_materno,
            curp: planeacion.dt_aspirante.curp
          },
          planeaciones: []
        };
      }

      // Agregar la planeación al arreglo de planeaciones del facilitador
      acc[facilitadorId].planeaciones.push({
        id_planeacion: planeacion.id_planeacion,
        ruta_documento: planeacion.ruta_documento,
        id_tipo_documento: planeacion.id_tipo_documento,
        nombre_documento: planeacion.id_tipo_documento_ct_documentos_aneec.nombre, // Incluir el nombre del documento
        dt_diagnostico_id: planeacion.dt_diagnostico_id,
        ct_usuario_in: planeacion.ct_usuario_in,
        ct_usuario_at: planeacion.ct_usuario_at,
        createdAt: planeacion.createdAt,
        updatedAt: planeacion.updatedAt,
        dt_diagnostico: planeacion.dt_diagnostico,
        ct_documentos_aneec: planeacion.id_tipo_documento_ct_documentos_aneec // Usar el alias correcto
      });

      return acc;
    }, {});

    // Convertir el objeto de planeaciones agrupadas a un arreglo
    const resultado = Object.values(planeacionesAgrupadas);

    return res.status(200).json({
      success: true,
      message: "Planeaciones obtenidas exitosamente",
      planeaciones: resultado
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

