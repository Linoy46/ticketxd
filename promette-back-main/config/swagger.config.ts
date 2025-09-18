import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { authSchemas, authPaths } from "../schemas/auth.schema";
import { userSchemas, userPaths } from "../schemas/user.schema";
import { multerSchemas, multerPaths } from "../schemas/multer.schema";
import {
  partidaAreaSchemas,
  partidaAreaPaths,
} from "../schemas/partidaAreaSchema";
import {
  productoAreaSchemas,
  productoAreaPaths,
} from "../schemas/productoAreaSchema";
import {
  administrativeUnitsSchemas,
  administrativeUnitsPaths,
} from "../schemas/administrativeUnitsSchema";
import { analistSchemas, analistPaths } from "../schemas/analistSchema";
import { budgetSchemas, budgetPaths } from "../schemas/budgetSchema";
import {
  correspondenciaSchemas,
  correspondenciaPaths,
} from "../schemas/correspondenciaSchema";

// Opciones de configuración para Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "PROMETTE API Documentation", // Título de la documentación de la API
      version: "1.0.0", // Versión de la API que se muestra en la documentación
      description: "Documentación de la API para el servidor PROMETTE", // Breve descripción de lo que hace la API
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}${
          // URL del servidor de desarrollo http://localhost:8000/app/promette/api/docs/
          process.env.HOST || ""
        }`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      schemas: {
        ...authSchemas,
        ...userSchemas,
        ...multerSchemas,
        ...partidaAreaSchemas,
        ...productoAreaSchemas,
        ...administrativeUnitsSchemas,
        ...analistSchemas,
        ...budgetSchemas,
        ...correspondenciaSchemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      ...authPaths,
      ...userPaths,
      ...multerPaths,
      ...partidaAreaPaths,
      ...productoAreaPaths,
      ...administrativeUnitsPaths,
      ...analistPaths,
      ...budgetPaths,
      ...correspondenciaPaths,
    },
  },
  apis: [], // Ya no necesitamos buscar en los archivos de rutas
};

// Generación de la especificación Swagger a partir de las opciones configuradas
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Exportación de los componentes necesarios para configurar la documentación Swagger
// `swaggerSetup` es el middleware que se utilizará para renderizar la interfaz de Swagger en el navegador
export const swaggerSetup = swaggerUi.setup(swaggerSpec);

// `swaggerServe` es el middleware que sirve la documentación de Swagger en una URL específica
export const swaggerServe = swaggerUi.serve;
