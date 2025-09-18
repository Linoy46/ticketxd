export const analistSchemas = {
  // Request Schemas
  RegisterAnalistRequest: {
    type: "object",
    required: ["ct_usuario_id", "ct_usuario_in"],
    properties: {
      ct_usuario_id: {
        type: "integer",
        description: "ID del usuario que será asignado como analista",
        minimum: 1,
      },
      rl_area_financiero_id: {
        type: "integer",
        description:
          "ID de la unidad administrativa (rl_area_financiero.id_area_fin)",
        minimum: 1,
      },
      estado: {
        type: ["integer", "boolean"],
        description: "Estado del analista (1/true=activo, 0/false=inactivo)",
        enum: [0, 1, true, false],
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea el registro",
        minimum: 1,
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que modifica el registro",
        minimum: 1,
      },
    },
  },
  UpdateAnalistRequest: {
    type: "object",
    required: ["id_puesto_unidad"],
    properties: {
      id_puesto_unidad: {
        type: "integer",
        description: "ID único del analista a actualizar",
        minimum: 1,
      },
      ct_usuario_id: {
        type: "integer",
        description: "Nuevo ID del usuario",
        minimum: 1,
      },
      rl_area_financiero_id: {
        type: "integer",
        description: "Nuevo ID de la unidad administrativa",
        minimum: 1,
      },
      estado: {
        type: ["integer", "boolean"],
        description: "Nuevo estado del analista",
        enum: [0, 1, true, false],
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea",
        minimum: 1,
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que actualiza",
        minimum: 1,
      },
    },
  },
  DeleteAnalistRequest: {
    type: "object",
    required: ["id_puesto_unidad", "ct_usuario_at"],
    properties: {
      id_puesto_unidad: {
        type: "integer",
        description: "ID único del analista a eliminar",
        minimum: 1,
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que realiza la eliminación",
        minimum: 1,
      },
    },
  },

  // Response Schemas
  UsuarioResponse: {
    type: "object",
    properties: {
      nombre_usuario: {
        type: "string",
        description: "Nombre completo del usuario",
      },
      email: {
        type: "string",
        format: "email",
        description: "Correo electrónico del usuario",
      },
      curp: {
        type: "string",
        description: "CURP del usuario",
      },
      telefono: {
        type: "string",
        description: "Teléfono del usuario",
      },
    },
  },
  AreaFinancieraResponse: {
    type: "object",
    properties: {
      id_area_fin: {
        type: "integer",
        description: "ID único del área financiera",
      },
      id_financiero: {
        type: "integer",
        description: "ID del financiamiento",
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área de infraestructura",
      },
    },
  },
  AnalistResponse: {
    type: "object",
    properties: {
      id_puesto_unidad: {
        type: "integer",
        description: "ID único del analista",
      },
      ct_usuario_id: {
        type: "integer",
        description: "ID del usuario asignado como analista",
      },
      rl_area_financiero: {
        type: "integer",
        description: "ID de la unidad administrativa asignada",
      },
      estado: {
        type: "boolean",
        description: "Estado del analista (true=activo, false=inactivo)",
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que creó el registro",
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que modificó el registro",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación del registro",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
      },
      ct_usuario: {
        $ref: "#/components/schemas/UsuarioResponse",
      },
      rl_area_financiero_obj: {
        $ref: "#/components/schemas/AreaFinancieraResponse",
      },
    },
  },
  AnalistsListResponse: {
    type: "object",
    properties: {
      analysts: {
        type: "array",
        items: {
          $ref: "#/components/schemas/AnalistResponse",
        },
        description: "Lista de analistas",
      },
    },
  },
  SingleAnalistResponse: {
    type: "object",
    properties: {
      analyst: {
        $ref: "#/components/schemas/AnalistResponse",
      },
    },
  },
  CreateAnalistResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "Analista registrado correctamente",
      },
      analyst: {
        $ref: "#/components/schemas/AnalistResponse",
      },
    },
  },
  UpdateAnalistResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "Analista actualizado correctamente",
      },
      analyst: {
        type: "array",
        items: {
          type: "integer",
        },
        description:
          "Resultado de la actualización [número de filas afectadas]",
      },
    },
  },
  DeleteAnalistResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "Analista eliminado correctamente",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de error",
      },
      error: {
        type: "string",
        description: "Detalle del error (opcional)",
      },
    },
  },
};

export const analistPaths = {
  "/api/analist": {
    get: {
      summary: "Obtener todos los analistas",
      description:
        "Retorna una lista de todos los analistas activos con información del usuario y área asignada",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Lista de analistas obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AnalistsListResponse",
              },
            },
          },
        },
        "404": {
          description: "No se encontraron analistas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "No se encontraron analistas",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error al obtener los analistas",
              },
            },
          },
        },
      },
    },
  },
  "/api/analist/detail/{id_puesto_unidad}": {
    get: {
      summary: "Obtener un analista por ID",
      description:
        "Retorna los datos de un analista específico incluyendo información del usuario y área",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_puesto_unidad",
          required: true,
          schema: {
            type: "integer",
            minimum: 1,
          },
          description: "ID único del analista",
        },
      ],
      responses: {
        "200": {
          description: "Analista encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleAnalistResponse",
              },
            },
          },
        },
        "404": {
          description: "Analista no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Analista no encontrado",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error al obtener el analista",
              },
            },
          },
        },
      },
    },
  },
  "/api/analist/administrativeUnit/{id_area_fin}": {
    get: {
      summary: "Obtener analistas por unidad administrativa",
      description:
        "Retorna todos los analistas asignados a una unidad administrativa específica",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_area_fin",
          required: true,
          schema: {
            type: "integer",
            minimum: 1,
          },
          description: "ID de la unidad administrativa",
        },
      ],
      responses: {
        "200": {
          description: "Lista de analistas de la unidad administrativa",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AnalistsListResponse",
              },
            },
          },
        },
        "404": {
          description:
            "No se encontraron analistas para esta unidad administrativa",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "No se encontraron analistas para esta unidad administrativa",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error al obtener los analistas",
              },
            },
          },
        },
      },
    },
  },
  "/api/analist/register": {
    post: {
      summary: "Registrar un nuevo analista",
      description:
        "Crea un nuevo registro de analista validando que el usuario no sea ya analista de la misma unidad",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterAnalistRequest",
            },
            example: {
              ct_usuario_id: 5,
              rl_area_financiero_id: 2,
              estado: 1,
              ct_usuario_in: 1,
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Analista registrado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateAnalistResponse",
              },
            },
          },
        },
        "400": {
          description:
            "El usuario ya es analista de esta unidad administrativa",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "El usuario ya es analista de esta unidad administrativa",
              },
            },
          },
        },
        "422": {
          description: "Datos de entrada inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "La unidad administrativa ya tiene asignado a un analista",
                error: "Detalle del error",
              },
            },
          },
        },
      },
    },
  },
  "/api/analist/update": {
    put: {
      summary: "Actualizar un analista",
      description: "Actualiza los datos de un analista existente",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateAnalistRequest",
            },
            example: {
              id_puesto_unidad: 1,
              ct_usuario_id: 5,
              rl_area_financiero_id: 3,
              estado: true,
              ct_usuario_in: 1,
              ct_usuario_at: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Analista actualizado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateAnalistResponse",
              },
            },
          },
        },
        "404": {
          description: "Analista no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Analista no encontrado",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error al actualizar el analista",
              },
            },
          },
        },
      },
    },
  },
  "/api/analist/delete": {
    put: {
      summary: "Eliminar un analista (cambio de estado)",
      description:
        "Realiza una eliminación lógica cambiando el estado del analista a inactivo",
      tags: ["Analist"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/DeleteAnalistRequest",
            },
            example: {
              id_puesto_unidad: 1,
              ct_usuario_at: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Analista eliminado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeleteAnalistResponse",
              },
            },
          },
        },
        "404": {
          description: "Analista no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Analista no encontrado",
              },
            },
          },
        },
        "500": {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error al eliminar el analista",
              },
            },
          },
        },
      },
    },
  },
};
