// Importación de morgan para el registro (logging) de solicitudes HTTP en la aplicación
import morgan from "morgan";

// Configuración de morgan para registrar las solicitudes HTTP en formato 'dev', que proporciona información útil para el desarrollo
export const morganConfig = morgan("dev");
