import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbNames = (process.env.DBNAMES || "promette").split(",");
let conexiones: Record<string, Sequelize> = {};

// Función para conectar y sincronizar las bases de datos
export const connectAndSyncDatabases = async () => {
  //Que esta psando aquí
  /*
  if (process.env.NODE_ENV !== "development") {
    console.log(
      "✅ Entorno no es 'development'. No se realizarán sincronizaciones."
    );
    return conexiones;
  }*/

  if (Object.keys(conexiones).length > 0) {
    console.log("✅ Conexiones ya establecidas, no se requiere crear nuevas.");
    return conexiones;
  }

  // await createDatabasesIfNotExist();

  try {
    for (const dbName of dbNames) {
      const sequelize = new Sequelize(
        dbName,
        process.env.DB_USER || "root",
        process.env.DB_PASSWORD || "",
        {
          host: process.env.DB_HOST || "localhost",
          dialect: "mysql",
          logging: process.env.NODE_ENV === "development",
        }
      );

      await sequelize.authenticate();
      console.log(`✅ Conexión establecida con la base de datos "${dbName}".`);

      // Guardar la conexión en el objeto
      conexiones[dbName] = sequelize;
    }
  } catch (error: any) {
    console.error("❌ Error en la conexión/sincronización:", error.message);
    process.exit(1);
  }

  return conexiones;
};

// Función para obtener una conexión específica
export const getConexiones = async (dbName: string) => {
  if (Object.keys(conexiones).length === 0) {
    await connectAndSyncDatabases();
  }

  if (!conexiones[dbName]) {
    console.log(
      `❌ No existe una conexión establecida para la base de datos "${dbName}".`
    );
    return null;
  }

  return conexiones[dbName];
};
