import jwt from "jsonwebtoken";

// Helper para generar un token JWT
export const generateToken = (userId: number, expiresIn: any = "8h"): string => {

    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", {
        expiresIn,
    });
};

// Helper para verificar un token JWT
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "secret");
    } catch (error) {
        throw new Error("Token no válido o expirado");
    }
};

// Helper para decodificar un token JWT sin verificar
export const decodeToken = (token: string) => {
    return jwt.decode(token);
};
