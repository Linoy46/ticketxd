export const productoAreaSchemas = {
  // Request Schemas
  RestringirProductoRequest: {
    type: "object",
    required: ["id_area_fin", "id_producto", "ct_usuario_in"],
    properties: {
      id_area_fin: {
        type: "integer",
        description:
          "ID del área administrativa (rl_area_financiero.id_area_fin)",
        minimum: 1,
      },
      id_producto: {
        type: "integer",
        description: "ID del producto consumible",
        minimum: 1,
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea la restricción",
        minimum: 1,
      },
    },
  },
  RestringirMultiplesProductosRequest: {
    type: "object",
    required: ["id_area_fin", "productos", "ct_usuario_in"],
    properties: {
      id_area_fin: {
        type: "integer",
        description: "ID del área administrativa",
        minimum: 1,
      },
      productos: {
        type: "array",
        items: {
          type: "integer",
          minimum: 1,
        },
        description: "Array de IDs de productos a restringir",
        minItems: 1,
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea las restricciones",
        minimum: 1,
      },
    },
  },
  EliminarRestriccionRequest: {
    type: "object",
    required: ["ct_usuario_at"],
    properties: {
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que elimina la restricción",
        minimum: 1,
      },
    },
  },

  // Response Schemas
  ProductoResponse: {
    type: "object",
    properties: {
      id_producto: {
        type: "integer",
        description: "ID único del producto",
      },
      nombre_producto: {
        type: "string",
        description: "Nombre del producto",
      },
      // Solo incluye los campos que realmente existen en tu modelo
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
      nombre_area: {
        type: "string",
        description: "Nombre del área",
      },
    },
  },
  RestriccionProductoAreaResponse: {
    type: "object",
    properties: {
      id_producto_area: {
        type: "integer",
        description: "ID único de la restricción",
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área administrativa (columna interna)",
      },
      id_producto: {
        type: "integer",
        description: "ID del producto",
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que creó la restricción",
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que modificó la restricción",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación de la restricción",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
      },
      id_producto_ct_producto_consumible: {
        $ref: "#/components/schemas/ProductoResponse",
      },
      id_area_infra_rl_area_financiero: {
        $ref: "#/components/schemas/AreaFinancieraResponse",
      },
    },
  },
  PaginatedRestriccionesResponse: {
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
          $ref: "#/components/schemas/RestriccionProductoAreaResponse",
        },
      },
      pagination: {
        type: "object",
        properties: {
          total: {
            type: "integer",
            description: "Total de restricciones",
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
  VerificarRestriccionResponse: {
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
          esta_restringido: {
            type: "boolean",
            description: "Indica si el producto está restringido para el área",
          },
          puede_acceder: {
            type: "boolean",
            description:
              "Indica si el área puede acceder al producto (lógica inversa)",
          },
          restriccion: {
            $ref: "#/components/schemas/RestriccionProductoAreaResponse",
          },
        },
      },
    },
  },
  RestringirMultiplesResponse: {
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
          restringidos: {
            type: "array",
            items: {
              $ref: "#/components/schemas/RestriccionProductoAreaResponse",
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
      total_restringidos: {
        type: "integer",
        description: "Total de restricciones creadas exitosamente",
      },
      total_errores: {
        type: "integer",
        description: "Total de errores encontrados",
      },
    },
  },
  ResumenRestriccionesResponse: {
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
          area_id: {
            type: "integer",
            description: "ID del área administrativa",
          },
          total_productos: {
            type: "integer",
            description: "Total de productos en el sistema",
          },
          productos_restringidos: {
            type: "integer",
            description: "Productos restringidos para esta área",
          },
          productos_disponibles: {
            type: "integer",
            description: "Productos disponibles para esta área",
          },
          porcentaje_disponible: {
            type: "number",
            format: "float",
            description: "Porcentaje de productos disponibles",
          },
          partidas_permitidas: {
            type: "integer",
            description: "Número de partidas permitidas para esta área",
          },
          detalle_partidas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id_partida: { type: "integer" },
                clave_partida: { type: "string" },
                nombre_partida: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export const productoAreaPaths = {
  "/api/productoArea": {
    get: {
      summary: "Obtener todas las restricciones producto-área con paginación",
      tags: ["ProductoArea"],
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
          name: "id_producto",
          schema: { type: "integer", minimum: 1 },
          description: "Filtrar por ID de producto",
        },
      ],
      responses: {
        "200": {
          description: "Lista de restricciones obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedRestriccionesResponse",
              },
            },
          },
        },
        "500": { description: "Error interno del servidor" },
      },
    },
    post: {
      summary: "Crear una nueva restricción producto-área",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RestringirProductoRequest" },
            example: {
              id_area_infra: 1,
              id_producto: 5,
              ct_usuario_in: 1,
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Restricción creada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  restriccion: {
                    $ref: "#/components/schemas/RestriccionProductoAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "Datos requeridos faltantes" },
        "404": { description: "Área o producto no encontrado" },
        "409": { description: "La restricción ya existe" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/productoArea/{id_producto_area}": {
    get: {
      summary: "Obtener una restricción producto-área por ID",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_producto_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la restricción producto-área",
        },
      ],
      responses: {
        "200": {
          description: "Restricción encontrada",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  restriccion: {
                    $ref: "#/components/schemas/RestriccionProductoAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "ID requerido" },
        "404": { description: "Restricción no encontrada" },
        "500": { description: "Error interno del servidor" },
      },
    },
    put: {
      summary: "Actualizar una restricción producto-área",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_producto_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la restricción producto-área",
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
                id_producto: {
                  type: "integer",
                  description: "Nuevo ID del producto",
                  minimum: 1,
                },
                ct_usuario_at: {
                  type: "integer",
                  description: "ID del usuario que actualiza",
                  minimum: 1,
                },
              },
            },
            example: {
              id_area_infra: 2,
              id_producto: 6,
              ct_usuario_at: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Restricción actualizada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  restriccion: {
                    $ref: "#/components/schemas/RestriccionProductoAreaResponse",
                  },
                },
              },
            },
          },
        },
        "400": { description: "ID requerido" },
        "404": { description: "Restricción no encontrada" },
        "409": { description: "Ya existe una restricción con estos datos" },
        "500": { description: "Error interno del servidor" },
      },
    },
    delete: {
      summary: "Eliminar una restricción producto-área",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_producto_area",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID de la restricción producto-área",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EliminarRestriccionRequest" },
            example: {
              ct_usuario_at: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Restricción eliminada exitosamente",
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
        "404": { description: "Restricción no encontrada" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/productoArea/porArea/{id_area_infra}": {
    get: {
      summary: "Obtener productos restringidos para una unidad administrativa",
      tags: ["ProductoArea"],
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
          description: "Lista de productos restringidos",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  productos: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RestriccionProductoAreaResponse",
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
  "/api/productoArea/porProducto/{id_producto}": {
    get: {
      summary:
        "Obtener áreas que tienen restricciones para un producto específico",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id_producto",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID del producto",
        },
      ],
      responses: {
        "200": {
          description: "Lista de áreas con restricciones para el producto",
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
                      $ref: "#/components/schemas/RestriccionProductoAreaResponse",
                    },
                  },
                  total: { type: "integer" },
                },
              },
            },
          },
        },
        "400": { description: "ID de producto requerido" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/productoArea/disponibles/{id_area_infra}": {
    get: {
      summary:
        "Obtener productos disponibles (no restringidos) para una unidad administrativa",
      tags: ["ProductoArea"],
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
          in: "query",
          name: "id_partida",
          schema: { type: "integer", minimum: 1 },
          description: "Filtrar por ID de partida (opcional)",
        },
      ],
      responses: {
        "200": {
          description: "Lista de productos disponibles",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  msg: { type: "string" },
                  productos: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ProductoResponse" },
                  },
                  total: { type: "integer" },
                  restringidos_count: { type: "integer" },
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
  "/api/productoArea/verificarRestriccion/{id_area_infra}/{id_producto}": {
    get: {
      summary:
        "Verificar si un producto está restringido para un área específica",
      tags: ["ProductoArea"],
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
          name: "id_producto",
          required: true,
          schema: { type: "integer", minimum: 1 },
          description: "ID del producto",
        },
      ],
      responses: {
        "200": {
          description: "Resultado de la verificación de restricción",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VerificarRestriccionResponse",
              },
            },
          },
        },
        "400": { description: "Parámetros requeridos faltantes" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/productoArea/resumen/{id_area_infra}": {
    get: {
      summary: "Obtener resumen de restricciones para un área administrativa",
      tags: ["ProductoArea"],
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
          description: "Resumen de restricciones obtenido exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ResumenRestriccionesResponse",
              },
            },
          },
        },
        "400": { description: "ID del área requerido" },
        "500": { description: "Error interno del servidor" },
      },
    },
  },
  "/api/productoArea/restringirMultiples": {
    post: {
      summary: "Restringir múltiples productos para una unidad administrativa",
      tags: ["ProductoArea"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RestringirMultiplesProductosRequest",
            },
            example: {
              id_area_infra: 1,
              productos: [5, 6, 7, 8],
              ct_usuario_in: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Proceso de restricción completado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RestringirMultiplesResponse",
              },
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
