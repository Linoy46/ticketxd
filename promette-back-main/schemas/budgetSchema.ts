// Esquemas y rutas de Swagger para Budget Controller

export const budgetSchemas = {
  Financiamiento: {
    type: "object",
    properties: {
      id_financiamiento: {
        type: "integer",
        description: "ID único del financiamiento",
        example: 1,
      },
      nombre_financiamiento: {
        type: "string",
        description: "Nombre del financiamiento",
        example: "Recursos Propios",
      },
      estado: {
        type: "integer",
        description: "Estado del financiamiento (1: activo, 0: inactivo)",
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
  FinanciamientoResponse: {
    type: "object",
    properties: {
      financiamientos: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Financiamiento",
        },
      },
    },
  },
  FinanciamientoSingleResponse: {
    type: "object",
    properties: {
      financiamiento: {
        $ref: "#/components/schemas/Financiamiento",
      },
    },
  },
  CreateFinanciamientoRequest: {
    type: "object",
    required: ["nombre_financiamiento", "estado"],
    properties: {
      nombre_financiamiento: {
        type: "string",
        description: "Nombre del financiamiento",
        example: "Recursos Federales",
      },
      estado: {
        type: "integer",
        description: "Estado del financiamiento (1: activo, 0: inactivo)",
        example: 1,
      },
    },
  },
  UpdateFinanciamientoRequest: {
    type: "object",
    required: ["id_financiamiento", "nombre_financiamiento", "estado"],
    properties: {
      id_financiamiento: {
        type: "integer",
        description: "ID del financiamiento a actualizar",
        example: 1,
      },
      nombre_financiamiento: {
        type: "string",
        description: "Nuevo nombre del financiamiento",
        example: "Recursos Propios Actualizados",
      },
      estado: {
        type: "integer",
        description: "Nuevo estado del financiamiento",
        example: 1,
      },
    },
  },
  DeleteFinanciamientoRequest: {
    type: "object",
    required: ["id_financiamiento"],
    properties: {
      id_financiamiento: {
        type: "integer",
        description: "ID del financiamiento a eliminar",
        example: 1,
      },
    },
  },
  AreaFinanciera: {
    type: "object",
    properties: {
      id_area_fin: {
        type: "integer",
        description: "ID del área financiera",
        example: 1,
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área de infraestructura",
        example: 5,
      },
    },
  },
  AreaFinancieraResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        example: "success",
      },
      results: {
        type: "array",
        items: {
          $ref: "#/components/schemas/AreaFinanciera",
        },
      },
    },
  },
  SuccessMessage: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        example: "Operación realizada correctamente",
      },
    },
  },
  ErrorMessage: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        example: "Error en la operación",
      },
    },
  },
};

export const budgetPaths = {
  "/api/budget/financiamientos/{id_usuario}": {
    get: {
      tags: ["Budget - Financiamientos"],
      summary: "Obtener financiamientos por usuario",
      description:
        "Obtiene los financiamientos disponibles para un usuario específico. Si es jefe muestra todos, si es analista solo los asignados.",
      parameters: [
        {
          name: "id_usuario",
          in: "path",
          required: true,
          description: "ID del usuario",
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
          description: "Financiamientos obtenidos correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FinanciamientoResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
  },
  "/api/budget/financiamientos": {
    get: {
      tags: ["Budget - Financiamientos"],
      summary: "Obtener todos los financiamientos",
      description:
        "Obtiene todos los financiamientos activos sin filtro de usuario",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Financiamientos obtenidos correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FinanciamientoResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Budget - Financiamientos"],
      summary: "Crear nuevo financiamiento",
      description: "Crea un nuevo financiamiento en el sistema",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateFinanciamientoRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Financiamiento creado correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Financiamiento creado correctamente",
                  },
                  financiamiento: {
                    $ref: "#/components/schemas/Financiamiento",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Ya existe un financiamiento con ese nombre",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Ya existe un financiamiento con ese nombre",
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
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Budget - Financiamientos"],
      summary: "Actualizar financiamiento",
      description: "Actualiza un financiamiento existente",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateFinanciamientoRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Financiamiento actualizado correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Financiamiento actualizado correctamente",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Ya existe un financiamiento con ese nombre",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Ya existe un financiamiento con ese nombre",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Financiamiento no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "No se encontró el financiamiento para actualizar",
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
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Budget - Financiamientos"],
      summary: "Eliminar financiamiento",
      description: "Desactiva un financiamiento (cambia estado a 0)",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/DeleteFinanciamientoRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Financiamiento eliminado correctamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Financiamiento eliminado correctamente",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Financiamiento no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Financiamiento no encontrado",
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
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
  },
  "/api/budget/financiamiento/{id_financiamiento}": {
    get: {
      tags: ["Budget - Financiamientos"],
      summary: "Obtener financiamiento por ID",
      description: "Obtiene un financiamiento específico por su ID",
      parameters: [
        {
          name: "id_financiamiento",
          in: "path",
          required: true,
          description: "ID del financiamiento",
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
          description: "Financiamiento obtenido correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FinanciamientoSingleResponse",
              },
            },
          },
        },
        404: {
          description: "Financiamiento no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Financiamiento no encontrado",
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
                $ref: "#/components/schemas/ErrorMessage",
              },
            },
          },
        },
      },
    },
  },
  "/api/budget/export-excel": {
    get: {
      tags: ["Budget - Reportes"],
      summary: "Exportar presupuestos a Excel",
      description:
        "Genera y descarga un archivo Excel con todos los techos presupuestales y sus datos relacionados",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Archivo Excel generado correctamente",
          content: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              {
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
                example: "attachment; filename=Presupuestos_1726647600000.xlsx",
              },
            },
          },
        },
        500: {
          description: "Error al generar el Excel",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Error al generar el Excel",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/budget/area-financiera/{id_area_infra}": {
    get: {
      tags: ["Budget - Áreas"],
      summary: "Obtener áreas financieras por área de infraestructura",
      description:
        "Obtiene los IDs de áreas financieras asociadas a un área de infraestructura específica",
      parameters: [
        {
          name: "id_area_infra",
          in: "path",
          required: true,
          description: "ID del área de infraestructura",
          schema: {
            type: "integer",
            example: 5,
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
          description: "Áreas financieras obtenidas correctamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AreaFinancieraResponse",
              },
            },
          },
        },
        400: {
          description: "ID inválido",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "ID inválido",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "No se encontraron áreas financieras",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example:
                      "No se encontraron áreas financieras para el área infra proporcionada",
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
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Ocurrió un error en el servidor",
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
