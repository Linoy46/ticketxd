export const administrativeUnitsSchemas = {
  // Request Schemas
  RegisterAdministrativeUnitRequest: {
    type: "object",
    required: ["id_financiero", "id_area_infra", "ct_usuario_in"],
    properties: {
      id_financiero: {
        type: "integer",
        description: "ID del financiamiento",
        minimum: 1,
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área de infraestructura",
        minimum: 1,
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que crea la unidad administrativa",
        minimum: 1,
      },
    },
  },
  UpdateAdministrativeUnitRequest: {
    type: "object",
    required: ["id_area_fin"],
    properties: {
      id_area_fin: {
        type: "integer",
        description: "ID de la unidad administrativa a actualizar",
        minimum: 1,
      },
      id_financiero: {
        type: "integer",
        description: "Nuevo ID del financiamiento",
        minimum: 1,
      },
      id_area_infra: {
        type: "integer",
        description: "Nuevo ID del área de infraestructura",
        minimum: 1,
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que actualiza",
        minimum: 1,
      },
    },
  },

  // Response Schemas
  AdministrativeUnitResponse: {
    type: "object",
    properties: {
      id_area_fin: {
        type: "integer",
        description: "ID único de la unidad administrativa",
      },
      id_financiero: {
        type: "integer",
        description: "ID del financiamiento",
      },
      id_area_infra: {
        type: "integer",
        description: "ID del área de infraestructura",
      },
      ct_usuario_in: {
        type: "integer",
        description: "ID del usuario que creó la unidad",
      },
      ct_usuario_at: {
        type: "integer",
        description: "ID del usuario que modificó la unidad",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
      },
      nombre: {
        type: "string",
        description: "Nombre del área obtenido desde la API de infraestructura",
      },
      ct_usuario_in_ct_usuario: {
        type: "object",
        properties: {
          nombre_usuario: {
            type: "string",
            description: "Nombre del usuario que creó",
          },
        },
      },
      ct_usuario_at_ct_usuario: {
        type: "object",
        properties: {
          nombre_usuario: {
            type: "string",
            description: "Nombre del usuario que modificó",
          },
        },
      },
    },
  },
  AdministrativeUnitsListResponse: {
    type: "object",
    properties: {
      administrativeUnits: {
        type: "array",
        items: {
          $ref: "#/components/schemas/AdministrativeUnitResponse",
        },
        description: "Lista de unidades administrativas",
      },
    },
  },
  SingleAdministrativeUnitResponse: {
    type: "object",
    properties: {
      administrativeUnit: {
        $ref: "#/components/schemas/AdministrativeUnitResponse",
      },
    },
  },
  CreateAdministrativeUnitResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "Unidad administrativa registrada correctamente",
      },
      administrativeUnit: {
        $ref: "#/components/schemas/AdministrativeUnitResponse",
      },
    },
  },
  UpdateAdministrativeUnitResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "success",
      },
      administrativeUnit: {
        type: "array",
        items: {
          type: "integer",
        },
        description:
          "Resultado de la actualización [número de filas afectadas]",
      },
    },
  },
  DeleteAdministrativeUnitResponse: {
    type: "object",
    properties: {
      msg: {
        type: "string",
        description: "Mensaje de confirmación",
        example: "Unidad administrativa eliminada correctamente",
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
    },
  },
};

export const administrativeUnitsPaths = {
  "/api/administrativeUnits": {
    get: {
      summary: "Obtener todas las unidades administrativas",
      description:
        "Retorna una lista de todas las unidades administrativas con nombres obtenidos de la API de infraestructura",
      tags: ["Administrative Units"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description:
            "Lista de unidades administrativas obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdministrativeUnitsListResponse",
              },
            },
          },
        },
        "404": {
          description: "No se encontraron unidades administrativas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "No se encontraron unidades administrativas",
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
                msg: "Error al obtener las unidades administrativas",
              },
            },
          },
        },
      },
    },
  },
  "/api/administrativeUnits/{id_area_fin}": {
    get: {
      summary: "Obtener una unidad administrativa por ID",
      description:
        "Retorna los datos de una unidad administrativa específica incluyendo el nombre del área",
      tags: ["Administrative Units"],
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
          description: "Unidad administrativa encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleAdministrativeUnitResponse",
              },
            },
          },
        },
        "404": {
          description: "Unidad administrativa no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Unidad administrativa no encontrada",
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
                msg: "Error al obtener la unidad administrativa",
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Eliminar una unidad administrativa",
      description: "Elimina físicamente una unidad administrativa del sistema",
      tags: ["Administrative Units"],
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
          description: "ID de la unidad administrativa a eliminar",
        },
      ],
      responses: {
        "200": {
          description: "Unidad administrativa eliminada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeleteAdministrativeUnitResponse",
              },
            },
          },
        },
        "404": {
          description: "Unidad administrativa no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Unidad administrativa no encontrada",
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
                msg: "Error al eliminar la unidad administrativa",
              },
            },
          },
        },
      },
    },
  },
  "/api/administrativeUnits/register": {
    post: {
      summary: "Registrar una nueva unidad administrativa",
      description:
        "Crea una nueva unidad administrativa validando que no exista una relación duplicada",
      tags: ["Administrative Units"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterAdministrativeUnitRequest",
            },
            example: {
              id_financiero: 1,
              id_area_infra: 5,
              ct_usuario_in: 1,
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Unidad administrativa creada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateAdministrativeUnitResponse",
              },
            },
          },
        },
        "400": {
          description: "Ya existe una unidad administrativa con estos datos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Ya existe una unidad administrativa con estos datos",
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
                msg: "Error al registrar la unidad administrativa",
              },
            },
          },
        },
      },
    },
  },
  "/api/administrativeUnits/update": {
    put: {
      summary: "Actualizar una unidad administrativa",
      description: "Actualiza los datos de una unidad administrativa existente",
      tags: ["Administrative Units"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateAdministrativeUnitRequest",
            },
            example: {
              id_area_fin: 1,
              id_financiero: 2,
              id_area_infra: 6,
              ct_usuario_at: 1,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Unidad administrativa actualizada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateAdministrativeUnitResponse",
              },
            },
          },
        },
        "400": {
          description: "Error en la actualización",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Error en la actualización",
              },
            },
          },
        },
        "404": {
          description: "Unidad administrativa no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                msg: "Unidad administrativa no encontrada",
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
                msg: "Error al actualizar la unidad administrativa",
              },
            },
          },
        },
      },
    },
  },
};
