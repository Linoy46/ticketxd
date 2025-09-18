import { Request, Response, NextFunction } from "express";

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff"); // Evita la interpretación incorrecta de tipos MIME
    res.setHeader("X-Frame-Options", "DENY"); // Previene ataques de Clickjacking
    res.setHeader("Referrer-Policy", "no-referrer"); // No compartir la URL de referencia
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()"); // Bloquea permisos del navegador
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'"); // Protección adicional contra Clickjacking
    next();
};
