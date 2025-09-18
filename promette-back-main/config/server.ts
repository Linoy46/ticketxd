import express, { Application } from "express"; // Importando el módulo Express y el tipo Application para la verificación de tipos
import { helmetConfig } from "../middlewares/helmet.md"; // Importando la configuración personalizada de Helmet para los encabezados HTTP de seguridad
import { corsConfig } from "../middlewares/cors.md"; // Importando la configuración personalizada de CORS para gestionar las solicitudes de diferentes orígenes
import { rateLimitConfig } from "./rateLimit.config"; // Importando la configuración de limitación de tasa para prevenir abusos
import { hppConfig } from "../middlewares/hpp.md"; // Importando la configuración para prevenir la contaminación de parámetros HTTP
import { morganConfig } from "../middlewares/morgan.md"; // Importando la configuración de Morgan para registrar las solicitudes HTTP
import { csrfConfig } from "../middlewares/csrf.md"; // Importando la configuración de protección CSRF
import cors from "cors";
import authRoutes from "../routes/authRoutes/auth.routes"; // Importando las rutas de autenticación
import userRoutes from "../routes/userRoutes/user.routes"; // Importando las rutas de usuarios
import userPositionRoutes from "../routes/userPositionRoutes/user.position.routes"; // Importando las rutas de los puestos asignados a los usuarios
import positionRoutes from "../routes/positionRoutes/position.routes"; // Importando las rutas de puestos
import sindicateRoutes from "../routes/sindicateRoutes/sindicate.routes"; // Importando las rutas de puestos
import tableRoutes from "../routes/tableRoutes/table.routes"; // Importando las rutas de tablas
import historyRoutes from "../routes/historyRoutes/history.routes"; // Importando las rutas de bitacora
import positionModuleRoutes from "../routes/positionModuleRoutes/position.module.routes"; // Importando las rutas de bitacora
import actionRoutes from "../routes/actionRoutes/action.routes"; // Importando las rutas de acciones
import departmentRoutes from "../routes/departmentRoutes/department.routes"; // Importando las rutas de departamentos
import areaRoutes from "../routes/areaRoutes/area.routes"; // Importando las rutas de áreas
import directionRoutes from "../routes/directionRoutes/direction.routes"; // Importando las rutas de direcciones
import deviceRoutes from "../routes/deviceRoutes/device.routes"; // Importando las rutas de dispositivos
import moduleRoutes from "../routes/moduleRoutes/module.routes"; // Importando las rutas de módulos
import moduleAreaRoutes from "../routes/moduleAreaRoutes/module.area.routes";
import functionRoutes from "../routes/functionRoutes/function.routes"; // Importando las rutas de acciones/funciones
import permissionsRoutes from "../routes/permissionsRoutes/permissions.routes"; // Importando las rutas de acciones/funciones
import certificatesRoutes from "../routes/certificatesRoutes/certificates.routes"; // Importando las rutas de acciones/funciones
import chapterRoutes from "../routes/chapterRoutes/chapter.routes"; // Importando las rutas de capítulos
import consumableDepartmentRoutes from "../routes/consumableDepartment/consumableDepartment.routes"; // Importando las rutas de departamentos de consumibles
import consumableDirectionRoutes from "../routes/consumableDirectionRoutes/consumableDirection.routes"; // Importando las rutas de direcciones de consumibles
import consumableInvoiceRoutes from "../routes/consumableInvoiceRoutes/consumableInvoice.routes";
import consumableProviderRoutes from "../routes/consumableProviderRoutes/consumableProvider.routes"; // Importando las rutas de proveedores de consumibles
import measurementUnitRoutes from "../routes/measurementUnitRoutes/measurementUnit.routes"; // Importando las rutas de unidades de medida
import municipalityRoutes from "../routes/municipalityRoutes/municipality.routes"; // Importando las rutas de municipios
import itemRoutes from "../routes/itemRoutes/item.routes"; // Importando las rutas de items
import consumableProductRoutes from "../routes/consumableProductRoutes/consumableProduct.routes"; // Importando las rutas de productos consumibles
import consumableInventoryRoutes from "../routes/consumableInventoryRoutes/consumableInventory.routes"; // Importando las rutas de inventarios de consumibles
import consumableDeliveryRoutes from "../routes/consumableDeliveryRoutes/consumableDelivery.routes"; // Importando las rutas de entregas de consumibles
import budgetCeilingRoutes from "../routes/budgetCeilingRoutes/budgetCeiling.routes"; // Importando las rutas de techos presupuestales
import budgetRoutes from "../routes/budgetRoutes/budget.routes"; // Importando las rutas de financiamientos
import requisitionRoutes from "../routes/requisitionRoutes/requisition.routes"; // Importando las rutas de requisiciones
import aneecApplicantRoutes from "../routes/aneecRoutes/applicant.routes"; // Importando las rutas de aplicantes aneec
import aneecEvaluatorRoutes from "../routes/aneecRoutes/evaluator.route"; // Importando las rutas para diagnosticos e informes aneec
import excelRoutes from "../routes/excelRoutes/excel.routes"; // Importando las rutas de excel
import anualProjectRoutes from "../routes/anualProjectRoutes/anualProject.routes"; // Importando las rutas de proyectos anuales
import justificacionRoutes from "../routes/justificacionRoutes/justificacion.routes"; // Importando las rutas de justificaciones
import { swaggerServe, swaggerSetup } from "./swagger.config"; // Importando la configuración de Swagger para servir la documentación de la API
import { connectAndSyncDatabases } from "../conexions/conexions";
import { securityHeaders } from "./headers.config";
import analistRoutes from "../routes/analistRoutes/analist.routes"; // Importando las rutas de analistas
import correspondenciaRoutes from "../routes/CorrespondenciaRoutes/correspondencia.route"; // Importando las rutas de correspondencia
import administrativeUnitsRoutes from "../routes/administrativeUnitsRoutes/administrativeUnits.routes";
import entregaFormatoRoutes from "../routes/entregaFormatoRoutes/entregaFormato.routes"; // Importar las rutas del formato de entrega
import pdfRoutes from "../routes/pdfRoutes/pdf.routes"; // Importar las rutas de PDF
import partidaAreaRoutes from "../routes/partidaAreaRoutes/partidaArea.routes"; // Importar las rutas de partida-área
import productoAreaRoutes from "../routes/productoAreaRoutes/productoArea.routes"; // Importar las rutas de producto-área

class Server {
  public app: Application; // Instancia de la aplicación Express
  private port: string; // Puerto del servidor, predeterminado a 8000 si no se proporciona en las variables de entorno

  constructor() {
    // Inicializar la aplicación Express
    this.app = express();
    this.port = process.env.PORT || "8000"; // Establecer el puerto desde las variables de entorno o usar el predeterminado
    //this.dbConnection();
    this.middlewares();
    this.routes();
  }
  // Método para establecer las conexiones a las bases de datos (Rupet y Promette)
  private async dbConnection(): Promise<void> {
    try {
      // Esperar a que las conexiones a la base de datos se establezcan correctamente
      await connectAndSyncDatabases(); // Espera a que se resuelvan las conexiones

      console.log(
        "✅ Conexiones a las bases de datos establecidas correctamente."
      );
    } catch (error: any) {
      console.error(
        "❌ Error en la conexión a las bases de datos:",
        error.message || ""
      );
      process.exit(1); // Terminar proceso si falla la conexión a la base de datos
    }
  }

  // Método para configurar todos los middlewares
  private middlewares() {
    // Aplicar el middleware de Helmet para los encabezados de seguridad
    this.app.use(helmetConfig);

    // Aplicar el middleware CORS para gestionar solicitudes de diferentes orígenes
    //this.app.use(corsConfig);
    this.app.use(cors());

    // Aplicar limitación de tasa para evitar ataques de fuerza bruta
    //this.app.use(rateLimitConfig);

    // Aplicar middleware para prevenir contaminación de parámetros HTTP (HPP)
    this.app.use(hppConfig);

    this.app.use(securityHeaders);
    // Aplicar el middleware de Morgan para registrar las solicitudes HTTP si el entorno es 'desarrollo'
    if (process.env.NODE_ENV === "development") {
      this.app.use(morganConfig);
    }

    // Middleware para analizar los cuerpos de las solicitudes en formato JSON
    this.app.use(express.json());

    // Servir archivos estáticos desde el directorio 'public'
    this.app.use(express.static("public"));

    // Aplicar protección CSRF
    // this.app.use(csrfConfig);
  }

  // Método para definir todas las rutas del servidor
  private routes() {
    // Documentación de la API
    this.app.use(`${process.env.HOST}api/docs`, swaggerServe, swaggerSetup); // Rutas de autenticación y usuarios
    this.app.use(`${process.env.HOST}api/auth`, authRoutes); // Rutas de autenticación montadas en /api/auth
    this.app.use(`${process.env.HOST}api/user`, userRoutes); // Rutas de usuarios montadas en /api/users
    this.app.use(`${process.env.HOST}api/userPosition`, userPositionRoutes); // Rutas de usuarios montadas en /api/users
    this.app.use(`${process.env.HOST}api/position`, positionRoutes); // Rutas de usuarios montadas en /api/users
    this.app.use(`${process.env.HOST}api/sindicate`, sindicateRoutes); // Rutas de usuarios montadas en /api/users
    this.app.use(`${process.env.HOST}api/table`, tableRoutes); // Rutas de usuarios montadas en /api/table
    this.app.use(`${process.env.HOST}api/history`, historyRoutes); // Rutas de usuarios montadas en /api/history
    this.app.use(`${process.env.HOST}api/positionModule`, positionModuleRoutes); // Rutas de usuarios montadas en /api/positionModule
    this.app.use(`${process.env.HOST}api/action`, actionRoutes); // Rutas de usuarios montadas en /api/action
    this.app.use(`${process.env.HOST}api/department`, departmentRoutes); // Rutas de usuarios montadas en /api/department
    this.app.use(`${process.env.HOST}api/area`, areaRoutes); // Rutas de áreas montadas en /api/area
    this.app.use(`${process.env.HOST}api/direction`, directionRoutes); // Rutas de direcciones montadas en /api/direction
    this.app.use(`${process.env.HOST}api/device`, deviceRoutes); // Rutas de dispositivos montadas en /api/device
    this.app.use(`${process.env.HOST}api/module`, moduleRoutes); // Rutas de módulos montadas en /api/module
    this.app.use(`${process.env.HOST}api/moduleArea`, moduleAreaRoutes); // Rutas de módulos montadas en /api/moduleArea
    this.app.use(`${process.env.HOST}api/function`, functionRoutes); // Rutas de módulos montadas en /api/function
    this.app.use(`${process.env.HOST}api/permissions`, permissionsRoutes); // Rutas de módulos montadas en /api/permissions
    this.app.use(`${process.env.HOST}api/certificates`, certificatesRoutes); // Rutas de módulos montadas en /api/certificates
    this.app.use(`${process.env.HOST}api/chapter`, chapterRoutes); // Añadimos las rutas de capítulos
    this.app.use(
      `${process.env.HOST}api/consumableDepartment`,
      consumableDepartmentRoutes
    ); // Añadimos las rutas de departamentos de consumibles
    this.app.use(
      `${process.env.HOST}api/consumableDirection`,
      consumableDirectionRoutes
    ); // Añadimos las rutas de direcciones de consumibles
    this.app.use(
      `${process.env.HOST}api/consumableInvoice`,
      consumableInvoiceRoutes
    ); // Añadimos las rutas de facturas de consumibles
    this.app.use(
      `${process.env.HOST}api/consumableProvider`,
      consumableProviderRoutes
    ); // Añadimos las rutas de proveedores de consumibles
    this.app.use(
      `${process.env.HOST}api/measurementUnit`,
      measurementUnitRoutes
    ); // Añadimos las rutas de unidades de medida
    this.app.use(`${process.env.HOST}api/municipality`, municipalityRoutes); // Añadimos las rutas de municipios
    this.app.use(`${process.env.HOST}api/item`, itemRoutes); // Añadimos las rutas de partidas
    this.app.use(
      `${process.env.HOST}api/consumableProduct`,
      consumableProductRoutes
    ); // Añadimos las rutas de productos consumibles
    this.app.use(
      `${process.env.HOST}api/consumableInventory`,
      consumableInventoryRoutes
    ); // Añadimos las rutas de inventarios de consumibles
    this.app.use(
      `${process.env.HOST}api/consumableDelivery`,
      consumableDeliveryRoutes
    ); // Añadimos las rutas de entregas de consumibles
    this.app.use(`${process.env.HOST}api/budgetCeiling`, budgetCeilingRoutes); // Añadimos las rutas de techos presupuestales
    this.app.use(`${process.env.HOST}api/budget`, budgetRoutes); // Añadimos las rutas de financiamientos
    this.app.use(`${process.env.HOST}api/requisition`, requisitionRoutes); // Añadimos las rutas de requisiciones
    this.app.use(`${process.env.HOST}api/annecApplicant`, aneecApplicantRoutes); // Rutas de registro de aplicantes aneec
    this.app.use(`${process.env.HOST}api/annecEvaluator`, aneecEvaluatorRoutes); // Rutas para diagnosticos e informes
    this.app.use(`${process.env.HOST}api/anualProject`, anualProjectRoutes); // Nuevas rutas de proyectos anuales
    this.app.use(`${process.env.HOST}api/justificacion`, justificacionRoutes); // Nuevas rutas de justificaciones
    this.app.use(`${process.env.HOST}api/analist`, analistRoutes); // Rutas de analistas montadas en /api/analist
    this.app.use(`${process.env.HOST}api/excel`, excelRoutes); // Añadimos las rutas para generación de ExcelveChanges
    this.app.use(
      `${process.env.HOST}api/correspondenciaRoutes`,
      correspondenciaRoutes
    ); // Rutas para la correspondencia
    this.app.use(
      `${process.env.HOST}api/administrativeUnits`,
      administrativeUnitsRoutes
    ); // Rutas para las unidades administrativas// Agregar las rutas del formato de entrega
    this.app.use(`${process.env.HOST}api/entregaFormato`, entregaFormatoRoutes);
    this.app.use(`${process.env.HOST}api/pdf`, pdfRoutes); // Añadir rutas de generación de PDF
    this.app.use(`${process.env.HOST}api/partidaArea`, partidaAreaRoutes); // Añadir rutas de gestión de acceso a partidas por área (whitelist)
    this.app.use(`${process.env.HOST}api/productoArea`, productoAreaRoutes); // Añadir rutas de gestión de restricciones de productos por área (blacklist)
  }

  // Método para iniciar el servidor y escuchar en el puerto especificado
  public listen() {
    // Iniciar el servidor Express en el puerto especificado
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${this.port}`); // Registrar el puerto en el que está escuchando el servidor
    });
  }
}

export default Server;
