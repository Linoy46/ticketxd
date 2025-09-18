// Importación del módulo cors para manejar la política de CORS en la aplicación
import cors from "cors";
require('dotenv').config();

// Configuración de CORS para la aplicación
export const corsConfig = cors({
  // `origin`: Define los orígenes permitidos para las solicitudes CORS.
  // Si la variable de entorno `ALLOWED_ORIGINS` está definida, la utiliza; de lo contrario, permite solicitudes de cualquier origen (`*`).
  origin: process.env.ALLOWED_ORIGINS?.split(",") || '*',

  // `methods`: Define los métodos HTTP permitidos en las solicitudes CORS.
  // Permitir todos los métodos habituales más OPTIONS para preflight
  methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",

  // `allowedHeaders`: Define los encabezados que se pueden incluir en las solicitudes CORS.
  // Se amplía la lista para incluir encabezados personalizados y estándar
  allowedHeaders:
    "Content-Type,Authorization,X-Debug-Info,X-Request-ID,X-Debug,Origin,Accept,X-Requested-With",

  // Permitir que las credenciales sean enviadas con la solicitud
  credentials: true,

  // Maximizar compatibilidad con diferentes navegadores
  maxAge: 86400, // 24 horas en segundos

  // Devolver encabezados de exposición para el cliente
  exposedHeaders: "Content-Length,Content-Type,Authorization",

  // Habilita la funcionalidad más permisiva para desarrollo
  preflightContinue: false,
  optionsSuccessStatus: 200, // Cambiar a 200 para mejor compatibilidad
});
