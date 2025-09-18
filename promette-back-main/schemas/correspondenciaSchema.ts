// Esquemas y rutas de Swagger para Correspondencia Controller

export const correspondenciaSchemas = {
  EstadoCorrespondencia: {
    type: "object",
    properties: {
      id_correspondencia_estado: {
        type: "integer",
        description: "ID único del estado de correspondencia",
        example: 1,
      },
      nombre_estado: {
        type: "string",
        description: "Nombre del estado",
        example: "Pendiente",
      },
    },
  },
  FormaEntrega: {
    type: "object",
    properties: {
      id_forma_entrega: {
        type: "integer",
        description: "ID único de la forma de entrega",
        example: 1,
      },
      nombre_entrega: {
        type: "string",
        description: "Nombre de la forma de entrega",
        example: "Correo electrónico",
      },
    },
  },
  ClasificacionPrioridad: {
    type: "object",
    properties: {
      id_clasificacion_prioridad: {
        type: "integer",
        description: "ID único de la clasificación de prioridad",
        example: 1,
      },
      nombre_prioridad: {
        type: "string",
        description: "Nombre de la prioridad",
        example: "Alta",
      },
    },
  },
  Correspondencia: {
    type: "object",
    properties: {
      id_correspondencia: {
        type: "integer",
        description: "ID único de la correspondencia",
        example: 1,
      },
      folio_sistema: {
        type: "string",
        description: "Folio generado por el sistema",
        example: "DPE-OCI-0001",
      },
      fecha_correspondencia: {
        type: "string",
        format: "date",
        description: "Fecha de la correspondencia",
        example: "2025-07-18",
      },
      folio_correspondencia: {
        type: "string",
        description: "Folio original de la correspondencia",
        example: "OF-001-2025",
      },
      resumen_correspondencia: {
        type: "string",
        description: "Resumen o asunto de la correspondencia",
        example: "Solicitud de información presupuestaria",
      },
      ruta_correspondencia: {
        type: "string",
        description: "Ruta del archivo PDF",
        example: "DPE-OCI-0001.pdf",
      },
      ct_usuarios_in: {
        type: "integer",
        description: "ID del usuario que crea la correspondencia",
        example: 1,
      },
      ct_clasificacion_prioridad_id: {
        type: "integer",
        description: "ID de la clasificación de prioridad",
        example: 1,
      },
      ct_forma_entrega_id: {
        type: "integer",
        description: "ID de la forma de entrega",
        example: 1,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
        example: "2025-07-18T10:00:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2025-07-18T10:00:00.000Z",
      },
    },
  },
  CorrespondenciaCompleta: {
    type: "object",
    allOf: [
      { $ref: "#/components/schemas/Correspondencia" },
      {
        type: "object",
        properties: {
          ct_clasificacion_prioridad: {
            $ref: "#/components/schemas/ClasificacionPrioridad",
          },
          ct_forma_entrega: {
            $ref: "#/components/schemas/FormaEntrega",
          },
          rl_correspondencia_usuario_estados: {
            type: "array",
            items: {
              $ref: "#/components/schemas/CorrespondenciaUsuarioEstado",
            },
          },
        },
      },
    ],
  },
  CorrespondenciaUsuarioEstado: {
    type: "object",
    properties: {
      id_correspondencia_usuario: {
        type: "integer",
        description: "ID único del registro de correspondencia-usuario-estado",
        example: 1,
      },
      dt_correspondencia_id: {
        type: "integer",
        description: "ID de la correspondencia",
        example: 1,
      },
      rl_usuario_puesto_id: {
        type: "integer",
        description: "ID del puesto del usuario destinatario",
        example: 1,
      },
      ct_correspondencia_estado: {
        type: "integer",
        description: "ID del estado de la correspondencia",
        example: 1,
      },
      observaciones: {
        type: "string",
        description: "Observaciones del estado",
        example: "Revisado y aprobado",
        nullable: true,
      },
      ct_usuarios_in: {
        type: "integer",
        description: "ID del usuario que modifica el estado",
        example: 1,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación del estado",
        example: "2025-07-18T10:00:00.000Z",
      },
    },
  },
  CreateCorrespondenciaRequest: {
    type: "object",
    required: [
      "id_usuario_puesto",
      "id_usuario_puesto_2",
      "ct_clasificacion_prioridad_id",
      "ct_forma_entrega_id",
      "folio_correspondencia",
      "resumen_correspondencia",
      "ct_usuarios_in",
      "fecha_correspondencia",
      "ruta_correspondencia",
    ],
    properties: {
      id_usuario_puesto: {
        type: "integer",
        description: "ID del puesto del usuario remitente",
        example: 1,
      },
      id_usuario_puesto_2: {
        type: "integer",
        description: "ID del puesto del usuario destinatario",
        example: 2,
      },
      ct_clasificacion_prioridad_id: {
        type: "integer",
        description: "ID de la clasificación de prioridad",
        example: 1,
      },
      ct_forma_entrega_id: {
        type: "integer",
        description: "ID de la forma de entrega",
        example: 1,
      },
      folio_correspondencia: {
        type: "string",
        description: "Folio original de la correspondencia",
        example: "OF-001-2025",
      },
      resumen_correspondencia: {
        type: "string",
        description: "Resumen o asunto de la correspondencia",
        example: "Solicitud de información presupuestaria",
      },
      ct_usuarios_in: {
        type: "integer",
        description: "ID del usuario que crea la correspondencia",
        example: 1,
      },
      fecha_correspondencia: {
        type: "string",
        format: "date",
        description: "Fecha de la correspondencia",
        example: "2025-07-18",
      },
      ruta_correspondencia: {
        type: "string",
        format: "binary",
        description: "Archivo PDF de la correspondencia",
      },
    },
  },
  FilterCorrespondenciaRequest: {
    type: "object",
    properties: {
      fecha: {
        type: "string",
        format: "date",
        description: "Fecha para filtrar correspondencias",
        example: "2025-07-18",
      },
      ct_clasificacion_prioridad_id: {
        type: "integer",
        description: "ID de la clasificación de prioridad",
        example: 1,
      },
      ct_forma_entrega_id: {
        type: "integer",
        description: "ID de la forma de entrega",
        example: 1,
      },
      id_usuario: {
        type: "integer",
        description: "ID del usuario para filtrar correspondencias",
        example: 1,
      },
      estado: {
        type: "integer",
        description: "Estado de la correspondencia para filtrar",
        example: 1,
      },
    },
  },
  EditObservacionesRequest: {
    type: "object",
    required: ["dt_correspondencia_id", "ct_correspondencia_estado"],
    properties: {
      dt_correspondencia_id: {
        type: "integer",
        description: "ID de la correspondencia",
        example: 1,
      },
      observaciones: {
        type: "string",
        description: "Observaciones del estado",
        example: "Revisado y requiere modificaciones",
      },
      ct_correspondencia_estado: {
        type: "integer",
        description: "Nuevo estado de la correspondencia",
        example: 2,
      },
      id_usuario_puesto_2: {
        type: "integer",
        description:
          "ID del puesto para derivaciones (requerido para estado 4)",
        example: 3,
      },
    },
  },
  EditCorrespondenciaRequest: {
    type: "object",
    required: ["id_correspondencia", "ct_usuarios_in"],
    properties: {
      id_correspondencia: {
        type: "integer",
        description: "ID de la correspondencia a editar",
        example: 1,
      },
      ct_usuarios_in: {
        type: "integer",
        description: "ID del usuario que edita",
        example: 1,
      },
      folio_correspondencia: {
        type: "string",
        description: "Nuevo folio de correspondencia",
        example: "OF-002-2025",
      },
      resumen_correspondencia: {
        type: "string",
        description: "Nuevo resumen de correspondencia",
        example: "Solicitud modificada",
      },
      ct_clasificacion_prioridad_id: {
        type: "integer",
        description: "Nueva clasificación de prioridad",
        example: 2,
      },
      ct_forma_entrega_id: {
        type: "integer",
        description: "Nueva forma de entrega",
        example: 2,
      },
      id_usuario_puesto: {
        type: "integer",
        description: "Nuevo ID del puesto remitente",
        example: 1,
      },
      id_usuario_puesto_2: {
        type: "integer",
        description: "Nuevo ID del puesto destinatario",
        example: 2,
      },
    },
  },
  ResumenCorrespondenciaArea: {
    type: "object",
    properties: {
      nombre_area: {
        type: "string",
        description: "Nombre del área",
        example: "Dirección de Planeación",
      },
      total_correspondencias: {
        type: "integer",
        description: "Total de correspondencias del área",
        example: 15,
      },
      resueltas: {
        type: "integer",
        description: "Correspondencias resueltas",
        example: 10,
      },
      concluidas: {
        type: "integer",
        description: "Correspondencias concluidas",
        example: 8,
      },
    },
  },
  SuccessResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Operación realizada correctamente",
      },
      data: {
        type: "object",
        description: "Datos de respuesta (variable según el endpoint)",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Error en la operación",
      },
      error: {
        type: "string",
        example: "Descripción detallada del error",
      },
      errores: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["Campo requerido faltante", "Formato inválido"],
      },
    },
  },
};

export const correspondenciaPaths = {
  "/api/correspondencia/estados": {
    get: {
      tags: ["Correspondencia - Catálogos"],
      summary: "Obtener estados de correspondencia",
      description:
        "Obtiene todos los estados disponibles para correspondencias",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Estados obtenidos correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/EstadoCorrespondencia",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/formas-entrega": {
    get: {
      tags: ["Correspondencia - Catálogos"],
      summary: "Obtener formas de entrega",
      description: "Obtiene todas las formas de entrega disponibles",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Formas de entrega obtenidas correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/FormaEntrega",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/clasificaciones-prioridad": {
    get: {
      tags: ["Correspondencia - Catálogos"],
      summary: "Obtener clasificaciones de prioridad",
      description: "Obtiene todas las clasificaciones de prioridad disponibles",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Clasificaciones obtenidas correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/ClasificacionPrioridad",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/crear": {
    post: {
      tags: ["Correspondencia - Gestión"],
      summary: "Crear nueva correspondencia",
      description: "Crea una nueva correspondencia con archivo PDF adjunto",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              $ref: "#/components/schemas/CreateCorrespondenciaRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Correspondencia creada correctamente",
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
                    example: "Correspondencia creada exitosamente",
                  },
                  data: {
                    $ref: "#/components/schemas/Correspondencia",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/filtrar": {
    post: {
      tags: ["Correspondencia - Consultas"],
      summary: "Filtrar correspondencias",
      description: "Obtiene correspondencias filtradas por diversos criterios",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/FilterCorrespondenciaRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Correspondencias obtenidas correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/CorrespondenciaCompleta",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/editar-observaciones": {
    post: {
      tags: ["Correspondencia - Gestión"],
      summary: "Editar observaciones y estado",
      description:
        "Actualiza las observaciones y estado de una correspondencia. Puede incluir archivo para respuestas (estado 3).",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              allOf: [
                {
                  $ref: "#/components/schemas/EditObservacionesRequest",
                },
                {
                  type: "object",
                  properties: {
                    archivo: {
                      type: "string",
                      format: "binary",
                      description:
                        "Archivo PDF para respuestas (opcional, requerido para estado 3)",
                    },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Observaciones y estado actualizados correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
            },
          },
        },
        400: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Registro no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/editar": {
    post: {
      tags: ["Correspondencia - Gestión"],
      summary: "Editar correspondencia completa",
      description:
        "Edita una correspondencia existente. Solo permite editar al usuario creador y si está en estado 1.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              allOf: [
                {
                  $ref: "#/components/schemas/EditCorrespondenciaRequest",
                },
                {
                  type: "object",
                  properties: {
                    archivo: {
                      type: "string",
                      format: "binary",
                      description: "Nuevo archivo PDF (opcional)",
                    },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Correspondencia editada correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
            },
          },
        },
        400: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        403: {
          description: "Sin permisos para editar",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example:
                      "Solo el usuario creador puede editar esta correspondencia",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Correspondencia no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/documento/{fileRoute}": {
    get: {
      tags: ["Correspondencia - Archivos"],
      summary: "Obtener documento de correspondencia",
      description: "Descarga un archivo PDF específico de correspondencia",
      parameters: [
        {
          name: "fileRoute",
          in: "path",
          required: true,
          description: "Nombre del archivo PDF",
          schema: {
            type: "string",
            example: "DPE-OCI-0001.pdf",
          },
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Archivo PDF",
          content: {
            "application/pdf": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        404: {
          description: "Archivo no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        400: {
          description: "Error al obtener el documento",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/generar-pdf/{id_correspondencia}": {
    get: {
      tags: ["Correspondencia - Reportes"],
      summary: "Generar PDF de acuse",
      description:
        "Genera un PDF con el acuse de recibo de una correspondencia específica",
      parameters: [
        {
          name: "id_correspondencia",
          in: "path",
          required: true,
          description: "ID de la correspondencia",
          schema: {
            type: "integer",
            example: 1,
          },
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "PDF generado correctamente",
          content: {
            "application/pdf": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
          headers: {
            "Content-Disposition": {
              description: "Nombre del archivo descargado",
              schema: {
                type: "string",
                example: "attachment; filename=correspondencia.pdf",
              },
            },
          },
        },
        404: {
          description: "Correspondencia no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error al generar el PDF",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/resumen-area": {
    get: {
      tags: ["Correspondencia - Reportes"],
      summary: "Obtener resumen por área",
      description:
        "Obtiene un resumen estadístico de correspondencias agrupadas por área",
      parameters: [
        {
          name: "fechaInicio",
          in: "query",
          required: false,
          description: "Fecha para filtrar el resumen",
          schema: {
            type: "string",
            format: "date",
            example: "2025-07-18",
          },
        },
        {
          name: "rl_usuario_puesto_id",
          in: "query",
          required: false,
          description: "ID del puesto para filtrar",
          schema: {
            type: "integer",
            example: 1,
          },
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Resumen obtenido correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/ResumenCorrespondenciaArea",
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Formato de fecha inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/correspondencia/enviar-curps": {
    post: {
      tags: ["Correspondencia - Integración"],
      summary: "Enviar CURPs a RUPEET",
      description:
        "Envía información de CURPs al sistema RUPEET para obtener datos de usuarios",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "CURPs enviados correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Información procesada correctamente",
                  },
                  data: {
                    type: "object",
                    description: "Datos obtenidos de RUPEET",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Token de autenticación no proporcionado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Token de autenticación no proporcionado",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error al procesar la solicitud",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Error al procesar la solicitud",
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
