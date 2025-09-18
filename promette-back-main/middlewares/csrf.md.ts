// Importación del módulo csrf para proteger la aplicación contra ataques CSRF (Cross-Site Request Forgery)
import csrf from "csurf";

// Configuración de CSRF para la aplicación
export const csrfConfig = csrf({
    // `cookie: true` habilita el uso de cookies para almacenar el token CSRF.
    // Esto significa que el token se enviará en una cookie que se utilizará para verificar la validez de la solicitud.
    cookie: true,
});
