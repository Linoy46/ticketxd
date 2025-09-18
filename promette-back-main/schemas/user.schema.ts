export const userSchemas = {
  UserResponse: {
    type: 'object',
    properties: {
      id_usuario: {
        type: 'integer',
        description: 'ID único del usuario'
      },
      nombre_usuario: {
        type: 'string',
        description: 'Nombre del usuario'
      },
      telefono: {
        type: 'string',
        description: 'Número telefónico'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico'
      },
      email_institucional: {
        type: 'string',
        format: 'email',
        description: 'Correo institucional'
      },
      curp: {
        type: 'string',
        description: 'CURP del usuario'
      },
      estado: {
        type: 'integer',
        description: 'Estado del usuario (1: activo, 0: inactivo)'
      }
    }
  }
};

export const userPaths = {
  '/api/user/{id_usuario}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtiene todos los usuarios',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id_usuario',
          required: true,
          schema: { type: 'integer' },
          description: 'ID del usuario que realiza la consulta'
        }
      ],
      responses: {
        200: {
          description: 'Lista de usuarios obtenida correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  users: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/UserResponse'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/user/register': {
    post: {
      tags: ['Usuarios'],
      summary: 'Registra un nuevo usuario',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['nombre_usuario', 'contrasena', 'email', 'curp'],
              properties: {
                nombre_usuario: { type: 'string' },
                contrasena: { type: 'string' },
                telefono: { type: 'string' },
                email: { type: 'string', format: 'email' },
                email_institucional: { type: 'string', format: 'email' },
                curp: { type: 'string' }
              }
            },
            example: {
              nombre_usuario: "uset_operator",
              contrasena: "Uset2024#",
              telefono: "2461234567",
              email: "operator@uset.com",
              email_institucional: "operator@septlaxcala.gob.mx",
              curp: "XAXX010101HTLXXXA5"
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Usuario creado correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                }
              },
              example: {
                msg: "El usuario se ha creado correctamente"
              }
            }
          }
        }
      }
    }
  },
  '/api/user/getById/{id_usuario}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtiene un usuario por ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id_usuario',
          required: true,
          schema: { type: 'integer' },
          description: 'ID del usuario a consultar'
        }
      ],
      responses: {
        200: {
          description: 'Usuario encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/UserResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/user/getByCurp/{curp}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtiene un usuario por CURP',
      parameters: [
        {
          in: 'path',
          name: 'curp',
          required: true,
          schema: { type: 'string' },
          description: 'CURP del usuario a consultar'
        }
      ],
      responses: {
        200: {
          description: 'Usuario encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userPromette: {
                    $ref: '#/components/schemas/UserResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/user/generate-curp': {
    post: {
      tags: ['Usuarios'],
      summary: 'Genera CURP para extranjeros',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['nombres', 'primerApellido', 'fechaNacimiento', 'sexo'],
              properties: {
                nombres: { type: 'string' },
                primerApellido: { type: 'string' },
                fechaNacimiento: { type: 'string', format: 'date' },
                sexo: { type: 'string', enum: ['H', 'M'] },
                paisOrigen: { type: 'string' }
              }
            },
            example: {
              nombres: "John",
              primerApellido: "Doe",
              fechaNacimiento: "1990-01-01",
              sexo: "H",
              paisOrigen: "USA"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'CURP generada correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  curp: { type: 'string' },
                  message: { type: 'string' }
                }
              },
              example: {
                curp: "DOJH900101HNEXXX05",
                message: "CURP generada exitosamente"
              }
            }
          }
        }
      }
    }
  }
};
