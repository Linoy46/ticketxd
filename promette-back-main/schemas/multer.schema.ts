// Esquemas para la documentación de las rutas relacionadas con la subida de archivos

export const multerSchemas = {
  // Esquema para representar un archivo subido
  UploadResult: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Ruta relativa del archivo almacenado",
        example: "/uploads/consumables/formatos-salida/123456.pdf",
      },
      replaced: {
        type: "boolean",
        description: "Indica si el archivo reemplazó uno existente",
        example: true,
      },
      originalName: {
        type: "string",
        description: "Nombre original del archivo subido por el usuario",
        example: "formato_salida.pdf",
      },
    },
  },

  // Esquema para representar una referencia a un documento
  DocumentReference: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "ID único del documento en la base de datos",
        example: "60d21b4667d0d8992e610c85",
      },
      path: {
        type: "string",
        description: "Ruta relativa al archivo",
        example:
          "/uploads/consumables/formatos-salida/60d21b4667d0d8992e610c85.pdf",
      },
      originalName: {
        type: "string",
        description: "Nombre original del archivo",
        example: "formato_de_salida_firmado.pdf",
      },
      uploadDate: {
        type: "string",
        format: "date-time",
        description: "Fecha y hora de la subida",
        example: "2023-06-22T15:30:45.123Z",
      },
      mimeType: {
        type: "string",
        description: "Tipo MIME del archivo",
        example: "application/pdf",
      },
    },
  },

  // Esquema para errores de subida
  UploadError: {
    type: "object",
    properties: {
      error: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        description: "Descripción del error ocurrido",
        example: "El tipo de archivo no está permitido",
      },
      code: {
        type: "string",
        description: "Código identificador del error",
        example: "INVALID_FILE_TYPE",
      },
    },
  },

  // Esquema para opciones de configuración de Multer
  MulterOptions: {
    type: "object",
    properties: {
      fieldName: {
        type: "string",
        description: "Nombre del campo del formulario que contiene el archivo",
        example: "documento",
      },
      documentType: {
        type: "string",
        description: "Tipo de documento o subcarpeta donde se guardará",
        example: "formatos-salida",
      },
      idField: {
        type: "string",
        description:
          "Nombre del campo que contiene el ID para nombrar el archivo",
        example: "folio",
      },
      keepOriginalName: {
        type: "boolean",
        description: "Si se debe mantener el nombre original del archivo",
        example: false,
      },
    },
  },
};

// Definición de rutas para la documentación de Swagger
export const multerPaths = {
  "/api/{module}/documents/upload/{id}": {
    post: {
      tags: ["Documentos"],
      summary: "Sube un documento asociado a un elemento específico",
      description:
        "Permite subir un archivo y asociarlo a un elemento mediante su ID",
      parameters: [
        {
          in: "path",
          name: "module",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "Módulo al que pertenece el documento (ej: consumables, inventories)",
          example: "consumables",
        },
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID del elemento al que se asociará el documento",
          example: "12345",
        },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "Archivo a subir (PDF o imagen)",
                },
                documentType: {
                  type: "string",
                  description: "Tipo de documento o subcarpeta",
                  example: "formatos-salida",
                },
              },
              required: ["file"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Documento subido correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Archivo subido correctamente",
                  },
                  data: {
                    $ref: "#/components/schemas/UploadResult",
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Error en la subida del archivo",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UploadError",
              },
            },
          },
        },
        "401": {
          description: "No autorizado",
        },
      },
    },
  },

  "/api/{module}/documents/{id}": {
    get: {
      tags: ["Documentos"],
      summary: "Obtiene un documento por su ID",
      description: "Recupera el archivo asociado a un ID específico",
      parameters: [
        {
          in: "path",
          name: "module",
          required: true,
          schema: {
            type: "string",
          },
          description: "Módulo al que pertenece el documento",
          example: "consumables",
        },
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID del documento o elemento asociado",
          example: "12345",
        },
      ],
      responses: {
        "200": {
          description: "Archivo encontrado",
          content: {
            "application/pdf": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
            "image/*": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        "404": {
          description: "Documento no encontrado",
        },
      },
    },
  },

  // Casos de uso comunes y ejemplos de configuración
  "/api/middlewares/multer-examples": {
    get: {
      tags: ["Documentos"],
      summary: "Documentación de casos de uso del middleware Multer",
      description:
        "Ejemplos de configuración para diversos escenarios de subida de archivos",
      responses: {
        "200": {
          description: "Documentación de casos de uso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  examples: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        caso: {
                          type: "string",
                          example: "Subida de formato PDF",
                        },
                        configuracion: {
                          type: "object",
                          properties: {
                            middleware: {
                              type: "string",
                              example:
                                "uploadFor('consumables', { documentType: 'formatos-salida', idField: 'folio' })",
                            },
                            implementacion: {
                              type: "string",
                              example: `
// Ejemplo de implementación en una ruta Express
router.post('/formatos/:folio/upload', 
  uploadFor('consumables', { 
    documentType: 'formatos-salida', 
    idField: 'folio',
    fieldName: 'documento'
  }),
  (req, res) => {
    try {
      const result = handleUpload(req);
      // Guardar referencia en BD
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);`,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Configuración dinámica del tipo de documento
  "/api/examples/dynamic-document-type": {
    post: {
      tags: ["Documentos"],
      summary: "Ejemplo con tipo de documento dinámico",
      description:
        "Demuestra cómo configurar el tipo de documento de forma dinámica basada en el request",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
                tipoDocumento: {
                  type: "string",
                  example: "certificados",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Ejemplo de implementación",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  implementacion: {
                    type: "string",
                    example: `
// Ejemplo con documentType como función
router.post('/documentos/:id', 
  uploadFor('recursos', { 
    documentType: (req) => req.body.tipoDocumento || 'general',
    idField: 'id'
  }),
  (req, res) => {
    // Procesamiento del archivo...
  }
);`,
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Preservar nombre original del archivo
  "/api/examples/preserve-filename": {
    post: {
      tags: ["Documentos"],
      summary: "Preservar nombre original del archivo",
      description:
        "Ejemplo de configuración para mantener el nombre original del archivo",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Ejemplo de implementación",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  configuracionMulter: {
                    type: "string",
                    example: `
// En multerConfig.ts usar keepOriginalName: true
const upload = createMulterConfig(module, {
  subfolder: documentType,
  idSuffix: id,
  keepOriginalName: true
});`,
                  },
                  implementacion: {
                    type: "string",
                    example: `
// En la ruta
router.post('/documentos/conservar-nombre',
  uploadFor('archivos', {
    documentType: 'originales',
    // Opcionalmente pasar keepOriginalName si se quiere sobreescribir el comportamiento por defecto
  }),
  (req, res) => {
    // Procesamiento...
  }
);`,
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Múltiples campos de archivo
  "/api/examples/multiple-fields": {
    post: {
      tags: ["Documentos"],
      summary: "Múltiples campos de archivo",
      description:
        "Ejemplo para manejar múltiples campos de archivo en el mismo formulario",
      responses: {
        "200": {
          description: "Ejemplo de implementación",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nota: {
                    type: "string",
                    example:
                      "Para manejar múltiples campos, se debe implementar una función personalizada basada en el middleware existente.",
                  },
                  implementacionSugerida: {
                    type: "string",
                    example: `
// Función auxiliar para manejar múltiples campos
const uploadMultipleFields = (module, fieldsConfig) => {
  return async (req, res, next) => {
    // Procesar cada campo de forma secuencial
    try {
      for (const [fieldName, config] of Object.entries(fieldsConfig)) {
        await new Promise((resolve, reject) => {
          uploadFor(module, { ...config, fieldName })(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
      next();
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: error.message,
        code: 'MULTI_UPLOAD_ERROR'
      });
    }
  };
};

// Uso en una ruta
router.post('/expediente/:id',
  uploadMultipleFields('expedientes', {
    'documentoIdentidad': { documentType: 'identificacion', idField: 'id' },
    'certificadoEstudios': { documentType: 'academico', idField: 'id' }
  }),
  (req, res) => {
    // Acceso a los archivos mediante req.files
    res.json({ success: true });
  }
);`,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
