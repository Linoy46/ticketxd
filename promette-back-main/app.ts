import dotenv from "dotenv";
import express from "express";
import retry from "async-retry";
import Server from "./config/server";
import { checkConnection, closeAllConnections, sequelize } from "./config/database";
import config from "./config";
import desgloseConceptoRoutes from './routes/excelRoutes/desgloseConcepto.routes';

// Configurar variables de entorno
dotenv.config();

const app = express();

const server = new Server();
//server.listen();

//* Sincroniza la base de datos y arranca el servidor
retry(
  async () => {
    console.log("Intentando conectar con la base de datos...");
    await checkConnection();
  },
  {
    retries: 5,
    minTimeout: 3000,
  }
)
  .then(async () => {
    console.log("✅ Conexión a la base de datos establecida");
    await sequelize.sync();
    console.log("✅ Sincronización completada");

    const servidor = server.listen();
    /*config.port, () => {
      console.log(
        `🚀 Servidor corriendo en el puerto ${config.port} (${config.nodeEnv})`
      );
    });*/

    //! Manejo de cierre gracioso
    /*
    process.on("SIGTERM", async () => {
      console.log("Recibida señal SIGTERM. Cerrando servidor...");
      server.app.close(async () => {
        await closeAllConnections();
        process.exit(0);
      });
    });*/

    //! Verificación periódica de la conexión
    setInterval(async () => {
      const isConnected = await checkConnection();
      if (!isConnected) {
        console.log("⚠️ Conexión perdida, intentando reconectar...");
        await checkConnection();
      }
    }, 30000); // Verificar cada 30 segundos

    app.use('/app/promette/api/excel', desgloseConceptoRoutes);
  })
  .catch((err: any) => {
    console.error(
      "❌ No se pudo conectar a la base de datos después de varios intentos:",
      err
    );
  });

export default app;
