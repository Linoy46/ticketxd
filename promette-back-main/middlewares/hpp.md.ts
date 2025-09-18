// Importación del módulo hpp para proteger la aplicación contra la contaminación de parámetros HTTP (HTTP Parameter Pollution)
import hpp from "hpp";

// Configuración de HPP (Protección contra la contaminación de parámetros HTTP)
export const hppConfig = hpp();
