import { body, ValidationChain } from "express-validator";
import fs from "fs";

export const validateCreateApplicantAneec: ValidationChain[] = [
  body("curp")
    .isString()
    .withMessage("La CURP es inválida")
    .trim()
    .notEmpty()
    .withMessage("La CURP es obligatoria")
    .isLength({ min: 18, max: 18 })
    .withMessage("La CURP debe tener 18 caracteres")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("nombre")
    .isString()
    .withMessage("El nombre es inválido")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("apellido_paterno")
    .isString()
    .withMessage("El apellido paterno es inválido")
    .trim()
    .notEmpty()
    .withMessage("El apellido paterno es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("apellido_materno")
    .isString()
    .withMessage("El apellido materno es inválido")
    .trim()
    .notEmpty()
    .withMessage("El apellido materno es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("correo")
    .isEmail()
    .withMessage("El correo es inválido")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("fecha_nacimiento")
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .custom((value, { req }) => {
      // Verificar si la fecha es válida, ya sea como string o como objeto Date
      const fecha = new Date(value);
      if (isNaN(fecha.getTime())) {
        if (req.files) {
          deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
        }
      }
      return true;
    }),

  body("instituto")
    .isString()
    .withMessage("El instituto es inválido")
    .trim()
    .notEmpty()
    .withMessage("El instituto es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("licenciatura")
    .isString()
    .withMessage("La licenciatura es inválida")
    .trim()
    .notEmpty()
    .withMessage("La licenciatura es obligatoria")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("direccion")
    .isString()
    .withMessage("La dirección es inválida")
    .trim()
    .notEmpty()
    .withMessage("La dirección es obligatoria")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("codigo_postal")
    .isString()
    .withMessage("El código postal es inválido")
    .trim()
    .notEmpty()
    .withMessage("El código postal es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("ct_municipio_id")
    .isInt()
    .withMessage("El municipio es inválido")
    .notEmpty()
    .withMessage("El municipio es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("localidad")
    .isString()
    .withMessage("La localidad es inválida")
    .trim()
    .notEmpty()
    .withMessage("La localidad es obligatoria")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),
  // Validación del campo 'telefono'
  body("telefono")
    .isString()
    .withMessage("El teléfono es inválido")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio")
    .isLength({ min: 10, max: 10 })
    .withMessage("El teléfono debe tener exactamente 10 caracteres")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  // Validación del campo 'tipo_documento'
  body("tipo_documento")
    .isString()
    .withMessage("El tipo de documento es inválido")
    .trim()
    .notEmpty()
    .withMessage("El tipo de documento es obligatorio")
    .isIn(["Constancia de estudios", "Carta pasante", "Titulo", "Cedula profesional"])
    .withMessage("El tipo de documento debe ser 'Constancia de estudios', 'Carta de pasante' , 'Titulo' o 'Cedula profesional'")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  // Validación del campo 'status'
  body("status")
    .isString()
    .withMessage("El estado es inválido")
    .trim()
    .notEmpty()
    .withMessage("El estado es obligatorio")
    .isIn(["EN PROCESO", "VALIDADO", "RECHAZADO"])
    .withMessage("El estado debe ser 'EN PROCESO', 'VALIDADO' o 'RECHAZADO'")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("ct_usuario_in")
    .isInt()
    .withMessage("El ID del usuario es inválido")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio")
    .custom((value, { req }) => {
      if (req.files && req.validationErrors) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }
      return true;
    }),

  body("diagnosticos")
    .optional()
    .custom((value, { req }) => {
      const licenciatura = req.body.licenciatura;

      if (licenciatura === "CRI" && !value) {
        return true;
      }

      if (licenciatura !== "CRI" && !value) {
        throw new Error("El campo 'diagnosticos' es obligatorio");
      }

      try {
        const diagnosticos = JSON.parse(value);

        if (!Array.isArray(diagnosticos)) {
          throw new Error("El campo 'diagnosticos' debe ser un arreglo");
        }

        if (diagnosticos.length === 0 || diagnosticos.length > 2) {
          throw new Error("Debe proporcionar al menos un diagnóstico y no sobrepasar el límite de dos.");
        }

        for (const diagnostico of diagnosticos) {
          if (!diagnostico.curp_usuario || typeof diagnostico.curp_usuario !== "string" || diagnostico.curp_usuario.length !== 18) {
            throw new Error("La CURP debe tener 18 caracteres");
          }

          if (!diagnostico.nombre_completoUsuario || typeof diagnostico.nombre_completoUsuario !== "string") {
            throw new Error("El nombre completo es obligatorio");
          }

          if (!diagnostico.ct_municipio_id_usuario || typeof diagnostico.ct_municipio_id_usuario !== "string") {
            throw new Error("El municipio es obligatorio");
          }

          if (!diagnostico.tipo_necesidad || typeof diagnostico.tipo_necesidad !== "string") {
            throw new Error("El tipo de necesidad es obligatorio");
          }

          if (!diagnostico.rehabilitacion_fisica || typeof diagnostico.rehabilitacion_fisica !== "string" || !["S", "N"].includes(diagnostico.rehabilitacion_fisica)) {
            throw new Error("El campo rehabilitacion fisica es obligatorio");
          }
        }

        return true;
      } catch (error) {
        if (req.files) {
          deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
        }

        if (error instanceof Error) {
          throw new Error(`Error en campos diagnósticos: ${error.message}`);
        } else {
          throw new Error("Error desconocido en la validación de diagnósticos");
        }
      }
    }),

  // Validación personalizada para asegurar que todos los archivos requeridos estén presentes
  body().custom((value, { req }) => {
    const licenciatura = req.body.licenciatura;
    const hasDiagnosticos = req.body.diagnosticos && req.body.diagnosticos.trim() !== '';

    // Si la licenciatura es "CRI" y no hay diagnósticos, solo validamos los archivos básicos
    if (licenciatura === "CRI" && !hasDiagnosticos) {
      const requiredFiles = [
        'ruta_ine',
        'ruta_comprobante_estudio',
        'ruta_comprobante_domicilio_facilitador',
        'ruta_carta_compromiso',
        'ruta_aviso_privacidad_aspirante'
      ];

      // Validar archivos únicos
      for (const field of requiredFiles) {
        if (!req.files || !req.files[field] || req.files[field].length === 0) {
          throw new Error(`El archivo ${field} es obligatorio.`);
        }
      }

      // Verificar que no haya archivos de diagnóstico
      const diagnosticFiles = [
        'ruta_diagnostico',
        'ruta_INE_tutor',
        'ruta_acta_nacimiento_usuario',
        'ruta_comprobante_domicilio_diagnosticado',
        'ruta_privacidad_usuario',
        'ruta_carta_compromiso_usuario'
      ];

      for (const field of diagnosticFiles) {
        if (req.files && req.files[field] && req.files[field].length > 0) {
          throw new Error(`No se permiten archivos de diagnóstico cuando no hay diagnósticos registrados.`);
        }
      }

      return true;
    }

    try {
      const requiredFiles = [
        'ruta_ine',
        'ruta_comprobante_estudio',
        'ruta_comprobante_domicilio_facilitador',
        'ruta_carta_compromiso',
        'ruta_aviso_privacidad_aspirante'
      ];

      const multiFileFields = [
        'ruta_diagnostico',
        'ruta_INE_tutor',
        'ruta_acta_nacimiento_usuario',
        'ruta_comprobante_domicilio_diagnosticado',
        'ruta_privacidad_usuario',
        'ruta_carta_compromiso_usuario'
      ];

      // Validar archivos únicos
      for (const field of requiredFiles) {
        if (!req.files || !req.files[field] || req.files[field].length === 0) {
          throw new Error(`El archivo ${field} es obligatorio.`);
        }
      }

      // Verificar que el campo 'diagnosticos' esté presente
      if (!hasDiagnosticos) {
        throw new Error("El campo 'diagnosticos' es obligatorio para esta licenciatura.");
      }

      const diagnosticos = JSON.parse(req.body.diagnosticos);
      const numDiagnosticos = diagnosticos.length;

      // Validar que cada campo de múltiples archivos tenga exactamente el mismo número de archivos que diagnósticos
      for (const field of multiFileFields) {
        if (!req.files || !req.files[field]) {
          throw new Error(`No se encontraron archivos para ${field}.`);
        }

        // Verificar que el número de archivos coincida exactamente con el número de diagnósticos
        if (req.files[field].length !== numDiagnosticos) {
          throw new Error(`El campo ${field} debe tener exactamente ${numDiagnosticos} archivo(s) (uno por cada diagnóstico). Faltan ${numDiagnosticos - req.files[field].length} archivo(s).`);
        }

        // Verificar que cada archivo tenga un nombre válido y no esté vacío
        for (let i = 0; i < req.files[field].length; i++) {
          const file = req.files[field][i];
          if (!file || !file.originalname) {
            throw new Error(`El archivo ${field} para el diagnóstico ${i + 1} está vacío o es inválido.`);
          }
        }
      }

      return true;
    } catch (error) {
      // Eliminar archivos subidos si hay un error en la validación
      if (req.files) {
        deleteUploadedFiles(req.files as { [fieldname: string]: Express.Multer.File[] });
      }

      if (error instanceof Error) {
        throw new Error(`Error en la validación de archivos: ${error.message}`);
      } else {
        throw new Error("Error desconocido en la validación de archivos.");
      }
    }
  }),
];

// Lista de campos de archivos para la creación o actualización de aspirantes y diagnósticos
const fileFields = [
  'ruta_ine',
  'ruta_comprobante_estudio',
  'ruta_comprobante_domicilio_facilitador',
  'ruta_comprobante_domicilio_diagnosticado',
  'ruta_carta_compromiso',
  'ruta_aviso_privacidad_aspirante',
  'ruta_diagnostico',
  'ruta_INE_tutor',
  'ruta_acta_nacimiento_usuario',
  'ruta_privacidad_usuario',
  'ruta_carta_compromiso_usuario'
];

// Función para eliminar archivos subidos
const deleteUploadedFiles = (files: { [fieldname: string]: Express.Multer.File[] }) => {
  const multiFileFields = [
    'ruta_diagnostico',
    'ruta_INE_tutor',
    'ruta_acta_nacimiento_usuario',
    'ruta_comprobante_domicilio_diagnosticado',
    'ruta_privacidad_usuario',
    'ruta_carta_compromiso_usuario'
  ];

  for (const field of fileFields) {
    if (files[field]) {
      // Si el campo puede tener múltiples archivos, iteramos sobre ellos
      if (multiFileFields.includes(field)) {
        for (const file of files[field]) {
          if (fs.existsSync(file.path)) { // Verificar si el archivo existe
            fs.unlinkSync(file.path); // Eliminar archivo subido
          }
        }
      } else if (files[field][0]) {
        // Para otros campos, solo eliminamos el primer archivo
        if (fs.existsSync(files[field][0].path)) { // Verificar si el archivo existe
          fs.unlinkSync(files[field][0].path); // Eliminar archivo subido
        }
      }
    }
  }
};