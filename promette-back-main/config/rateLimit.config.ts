import rateLimit from "express-rate-limit"; // Importa el middleware de rate limiting

export const rateLimitConfig = rateLimit({
  // Exporta la configuración del middleware
  windowMs: 15 * 60 * 1000, // Establece el tiempo de ventana a 15 minutos (15 minutos * 60 segundos * 1000 ms)
  max: 5000000, // Limita el número máximo de solicitudes a 100 por IP en la ventana de tiempo
  message: "Demasiadas solicitudes, intenta de nuevo más tarde.", // Mensaje que se muestra cuando se excede el límite
});
