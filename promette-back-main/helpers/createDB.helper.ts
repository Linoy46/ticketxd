import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Obtener las bases de datos desde la variable de entorno y dividirlas en un array
const dbNames = (process.env.DBNAMES || "").split(",");

// Función para crear la base de datos si no existe (solo en desarrollo)
const createDatabasesIfNotExist = async () => {
    if (process.env.NODE_ENV !== "development") return; // Solo en desarrollo

    try {
        // Conexión temporal sin base de datos específica
        const tempSequelize = new Sequelize(
            "",
            process.env.DB_USER || "root",
            process.env.DB_PASSWORD || "",
            {
                host: process.env.DB_HOST || "localhost",
                dialect: "mysql",
                logging: false, // No mostrar logs aquí
            }
        );

        // Iterar sobre cada base de datos y crearla si no existe
        for (const dbName of dbNames) {
            await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            console.log(`✅ Base de datos "${dbName}" verificada/creada correctamente.`);
        }

        await tempSequelize.close(); // Cerrar la conexión temporal
    } catch (error: any) {
        console.error(`❌ Error al verificar/crear bases de datos:`, error.message);
        process.exit(1);
    }
};
export default createDatabasesIfNotExist;
