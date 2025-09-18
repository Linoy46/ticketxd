/**
 * @fileoverview Configuración centralizada de la aplicación
 * Este archivo maneja todas las variables de entorno y configuraciones globales.
 *
 * @requires dotenv
 * @requires path
 * @requires jsonwebtoken
 */

import dotenv from "dotenv";
import path from "path";
import { SignOptions } from "jsonwebtoken";

// Determinar el entorno y cargar el archivo .env correspondiente
dotenv.config();

/**
 * Tipo que define el formato válido para la expiración del JWT
 * Ejemplos válidos: "1h", "2d", "7d", 3600 (segundos)
 */
type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;

/**
 * Interfaz que define la estructura de configuración
 * @interface Config
 */
interface Config {
  /** Puerto en el que se ejecutará el servidor */
  port: number;

  /** Configuración de la base de datos */
  db: {
    /** Nombre de la base de datos */
    name: string;
    /** Usuario de la base de datos */
    user: string;
    /** Contraseña de la base de datos */
    password: string;
    /** Host de la base de datos */
    host: string;
    /** Puerto de la base de datos */
    port: number;
  };

  /** Secreto para firmar los JWT */
  jwtSecret: string;

  /** Entorno de ejecución (development/production) */
  nodeEnv: string;

  /** Número de rondas para el hash de bcrypt */
  bcryptSaltRounds: number;

  /** Tiempo de expiración del JWT */
  jwtExpiresIn: ExpiresIn;

  /** Orígenes permitidos para CORS */
  allowedOrigins: string[];
}

/**
 * Configuración global de la aplicación
 * @constant
 */
const config: Config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    name: process.env.DBNAMES || "",
    //name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
  },
  jwtSecret: process.env.JWT_SECRET!,
  nodeEnv: process.env.NODE_ENV!,
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "1h") as ExpiresIn,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : (() => {
        throw new Error(
          "ALLOWED_ORIGINS no está configurado en el archivo .env"
        );
      })(),
};

export default config;

/**
 * @example Ejemplo de archivo .env
 *
 * # Servidor
 * PORT=3000
 * NODE_ENV=development
 *
 * # Base de datos
 * DB_NAME=mi_base_de_datos
 * DB_USER=usuario
 * DB_PASSWORD=contraseña
 * DB_HOST=localhost
 * DB_PORT=3306
 *
 * # Seguridad
 * JWT_SECRET=mi_secreto_muy_seguro
 * JWT_EXPIRES_IN=1h
 * BCRYPT_SALT_ROUNDS=10
 *
 * # CORS
 * ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
 */
