export const authSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['nombre_usuario', 'contrasena'],
    properties: {
      nombre_usuario: {
        type: 'string',
        description: 'Nombre de usuario para login'
      },
      contrasena: {
        type: 'string',
        description: 'Contraseña del usuario'
      }
    }
  },
  RegisterRequest: {
    type: 'object',
    required: ['nombre_usuario', 'contrasena', 'email', 'curp'],
    properties: {
      nombre_usuario: {
        type: 'string',
        description: 'Nombre de usuario para registro'
      },
      contrasena: {
        type: 'string',
        description: 'Contraseña del usuario'
      },
      telefono: {
        type: 'string',
        description: 'Número telefónico del usuario'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del usuario'
      },
      email_institucional: {
        type: 'string',
        format: 'email',
        description: 'Correo institucional del usuario'
      },
      curp: {
        type: 'string',
        description: 'CURP del usuario'
      }
    }
  },
  AuthResponse: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'JWT token de autenticación'
      },
      user: {
        type: 'object',
        properties: {
          id_usuario: {
            type: 'integer'
          },
          nombre_usuario: {
            type: 'string'
          },
          email: {
            type: 'string'
          }
        }
      }
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      msg: {
        type: 'string',
        description: 'Mensaje de error'
      },
      error: {
        type: 'object',
        description: 'Detalles del error'
      }
    }
  }
};

export const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Autenticación'],
      summary: 'Registra un nuevo usuario',
      description: 'Crea un nuevo usuario en el sistema con la información proporcionada',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest'
            },
            example: {
              nombre_usuario: "uset_admin",
              contrasena: "Uset2024#",
              telefono: "2461234567",
              email: "admin@uset.com",
              email_institucional: "admin@septlaxcala.gob.mx",
              curp: "XAXX010101HTLXXXA4"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Usuario registrado correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/AuthResponse'
                  },
                  msg: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Error de validación o usuario existente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Inicia sesión de usuario',
      description: 'Autentica al usuario y devuelve un token JWT',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest'
            },
            example: {
              nombre_usuario: "uset_admin",
              contrasena: "Uset2024#"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Inicio de sesión exitoso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse'
              }
            }
          }
        },
        401: {
          description: 'Credenciales inválidas',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/isLoggin': {
    get: {
      tags: ['Autenticación'],
      summary: 'Verifica estado de sesión',
      description: 'Verifica si el token JWT es válido y retorna los datos del usuario',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Usuario autenticado correctamente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse'
              }
            }
          }
        },
        401: {
          description: 'No autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/isAuthorization/{token}': {
    get: {
      tags: ['Autenticación'],
      summary: 'Verifica autorización por token',
      parameters: [
        {
          in: 'path',
          name: 'token',
          required: true,
          schema: { type: 'string' },
          description: 'Token JWT a verificar'
        }
      ],
      responses: {
        200: {
          description: 'Token válido'
        },
        404: {
          description: 'Token inválido o usuario no encontrado'
        }
      }
    }
  },
  '/api/auth/forgotPassword': {
    post: {
      tags: ['Autenticación'],
      summary: 'Solicita recuperación de contraseña',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email'
                }
              }
            },
            example: {
              email: "admin@uset.com"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Correo de recuperación enviado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                }
              },
              example: {
                msg: "Se ha enviado un enlace para recuperar la contraseña"
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/resetPassword': {
    post: {
      tags: ['Autenticación'],
      summary: 'Restablece la contraseña',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'contrasena'],
              properties: {
                token: {
                  type: 'string',
                  description: 'Token de recuperación'
                },
                contrasena: {
                  type: 'string',
                  description: 'Nueva contraseña'
                }
              }
            },
            example: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              contrasena: "NuevaUset2024#"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Contraseña actualizada correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                }
              },
              example: {
                msg: "Contraseña actualizada correctamente"
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/validateField': {
    post: {
      tags: ['Autenticación'],
      summary: 'Valida disponibilidad de campo',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['field', 'value'],
              properties: {
                field: {
                  type: 'string',
                  enum: ['nombre_usuario', 'email', 'curp']
                },
                value: { type: 'string' }
              }
            },
            example: {
              field: "nombre_usuario",
              value: "uset_admin"
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Validación exitosa',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string',
                    enum: ['Campo en uso', 'Campo disponible']
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
