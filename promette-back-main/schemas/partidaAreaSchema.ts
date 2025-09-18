export const partidaAreaSchemas = {
  // Request Schemas
  AsignarPartidaRequest: {
    type: "object",
    required: ["id_area_infra", "id_partida", "ct_usuario_in"],
    properties: {
      id_area_infra: {
        type: "integer",
        description:
          "ID del área administrativa (rl_area_financiero.id_area_infra)",
        minimum: 1,
      },
      id_partida: {
        type: "integer",
        description: "ID de la partida",
        minimum: 1,
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea la relación",
        minimum: 1,
      },
    },
  },
  AsignarMultiplesPartidasRequest: {
    type: "object",
    required: ["id_area_infra", "partidas", "ct_usuario_in"],
    properties: {
      id_area_infra: {
        type: "integer",
        description: "ID del área administrativa",
        minimum: 1,
      },
      partidas: {
        type: "array",
        items: {
          type: "integer",
          minimum: 1,
        },
        description: "Array de IDs de partidas a asignar",
        minItems: 1,
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea las relaciones",
        minimum: 1,
      },
    },
  },
  EliminarRelacionRequest: {
    type: "object",
    required: ["ct_usuario_at"],
    properties: {
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que elimina la relación",
        minimum: 1,
      },
    },
  },

  // Response Schemas
  PartidaResponse: {
    type: "object",
    properties: {
      id_partida: {
        type: "integer",
        description: "ID único de la partida",
      },
      clave_partida: {
        type: "string",
        description: "Clave de la partida",
      },
      nombre_partida: {
        type: "string",
        description: "Nombre de la partida",
      },
      estado: {
        type: "integer",
        description: "Estado de la partida (1=activo, 0=inactivo)",
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
      id_area_infra: {
        type: "integer",
        description: "ID del área de infraestructura",
      },
      ct_area: {
        type: "object",
        properties: {
          id_area: {
            type: "integer",
            description: "ID del área",
          },
          nombre_area: {
            type: "string",
            description: "Nombre del área",
          },
        },
      },
    },
  },
  RelacionPartidaAreaResponse: {
    type: "object",
    properties: {
      id_partida_area: {
        type: "integer",
        description: "ID único de la relación",
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área administrativa",
      },
      id_partida: {
        type: "integer",
        description: "ID de la partida",
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que creó la relación",
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que modificó la relación",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación de la relación",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
      },
      id_partida_ct_partida: {
        $ref: "#/components/schemas/PartidaResponse",
      },
      id_area_infra_rl_area_financiero: {
        $ref: "#/components/schemas/AreaFinancieraResponse",
      },
    },
  },
  PaginatedRelacionesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indica si la operación fue exitosa",
      },
      msg: {
        type: "string",
        description: "Mensaje descriptivo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/RelacionPartidaAreaResponse",
        },
      },
      pagination: {
        type: "object",
        properties: {
          total: {
            type: "integer",
            description: "Total de relaciones",
          },
          page: {
            type: "integer",
            description: "Página actual",
          },
          limit: {
            type: "integer",
            description: "Elementos por página",
          },
          totalPages: {
            type: "integer",
            description: "Total de páginas",
          },
        },
      },
    },
  },
  VerificarAccesoResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indica si la operación fue exitosa",
      },
      msg: {
        type: "string",
        description: "Mensaje descriptivo",
      },
      data: {
        type: "object",
        properties: {
          tiene_acceso: {
            type: "boolean",
            description: "Indica si el área tiene acceso a la partida",
          },
          relacion: {
            $ref: "#/components/schemas/RelacionPartidaAreaResponse",
          },
        },
      },
    },
  },
  AsignarMultiplesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indica si la operación fue exitosa",
      },
      msg: {
        type: "string",
        description: "Mensaje descriptivo",
      },
      data: {
        type: "object",
        properties: {
          asignadas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/RelacionPartidaAreaResponse",
            },
          },
          errores: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
      total_asignadas: {
        type: "integer",
        description: "Total de relaciones asignadas exitosamente",
      },
      total_errores: {
        type: "integer",
        description: "Total de errores encontrados",
      },
    },
  },
};

export const partidaAreaPaths = {
  "/api/partidaArea": {
    get: {
      summary: "Obtener todas las relaciones partida-área con paginación",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1, minimum: 1 },
          description: "Número de página",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
          description: "Elementos por página",
        },
        {
          in: "query",
          name: "id_area_infra",
          schema: { type: "integer", minimum: 1 },
          description: "Filtrar por ID del área administrativa",
        },
        {
          in: "query",
          name: "id_partida",
          schema: { type: "integer", minimum: 1 },
          description: "Filtrar por ID de partida",
        },
      ],
      responses: {
        "200": {
          description: "Lista de relaciones obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedRelacionesResponse",
              },
            },
          },
        },
        "500": { description: "Error interno del servidor" },
      },
    },
    post: {
      summary: "Crear una nueva relación partida-área",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AsignarPartidaRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Relación creada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  relacion: {
                    $ref: "#/components/schemas/RelacionPartidaAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "Datos requeridos faltantes" },
        "404": { description: "Área o partida no encontrada" },
        "409": { description: "La relación ya existe" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/partidaArea/{id_partida_area}": {
    get: {
      summary: "Obtener una relación partida-área por ID",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_partida_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la relación partida-área",
        },
      ],
      responses: {
        "200": {
          description: "Relación encontrada",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  relacion: {
                    $ref: "#/components/schemas/RelacionPartidaAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "ID requerido" },
        "404": { description: "Relación no encontrada" },
        "500": { description: "Error interno del servidor" },
      },
    },
    put: {
      summary: "Actualizar una relación partida-área",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_partida_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la relación partida-área",
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id_area_infra: {
                  type: "integer",
                  description: "Nuevo ID del área administrativa",
                  minimum: 1,
                },
                id_partida: {
                  type: "integer",
                  description: "Nuevo ID de la partida",
                  minimum: 1,
                },
                ct_usuario_at: {
                  type: "integer",
                  description: "ID del usuario que actualiza",
                  minimum: 1,
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Relación actualizada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  relacion: {
                    $ref: "#/components/schemas/RelacionPartidaAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "ID requerido" },
        "404": { description: "Relación no encontrada" },
        "409": { description: "Ya existe una relación con estos datos" },
        "500": { description: "Error interno del servidor" },
      },
    },
    delete: {
      summary: "Eliminar una relación partida-área",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_partida_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la relación partida-área",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EliminarRelacionRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Relación eliminada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                },
              },
            },
          },
        },
        "400": { description: "ID requerido o ct_usuario_at faltante" },
        "404": { description: "Relación no encontrada" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/partidaArea/porArea/{id_area_infra}": {
    get: {
      summary: "Obtener partidas permitidas para una unidad administrativa",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_area_infra",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID del área administrativa",
        },
      ],
      responses: {
        "200": {
          description: "Lista de partidas permitidas",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  partidas: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RelacionPartidaAreaResponse",
                    },
                  },
                  total: { type: "integer" },
                },
              },
            },
          },
        },
        "400": { description: "ID del área requerido" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/partidaArea/porPartida/{id_partida}": {
    get: {
      summary: "Obtener áreas que tienen acceso a una partida específica",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_partida",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la partida",
        },
      ],
      responses: {
        "200": {
          description: "Lista de áreas con acceso a la partida",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  areas: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RelacionPartidaAreaResponse",
                    },
                  },
                  total: { type: "integer" },
                },
              },
            },
          },
        },
        "400": { description: "ID de partida requerido" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/partidaArea/verificarAcceso/{id_area_infra}/{id_partida}": {
    get: {
      summary: "Verificar si un área tiene acceso a una partida específica",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_area_infra",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID del área administrativa",
        },
        {
          in: "path",
          name: "id_partida",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la partida",
        },
      ],
      responses: {
        "200": {
          description: "Resultado de la verificación de acceso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerificarAccesoResponse" },
            },
          },
        },
        "400": { description: "Parámetros requeridos faltantes" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/partidaArea/asignarMultiples": {
    post: {
      summary: "Asignar múltiples partidas a una unidad administrativa",
      tags: ["PartidaArea"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AsignarMultiplesPartidasRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Proceso de asignación completado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AsignarMultiplesResponse" },
            },
          },
        },
        "400": { description: "Datos requeridos faltantes" },
        "404": { description: "Área administrativa no existe" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
};
