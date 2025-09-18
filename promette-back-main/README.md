Proyecto Backend con Node.js y TypeScript

Este proyecto es un backend desarrollado en Node.js con TypeScript. Se conecta a una base de datos MySQL alojada en un servidor local con XAMPP.

Instalación de dependencias

Puedes instalar las dependencias usando npm o yarn:

Con npm:

npm install
npm install -g nodemon ts-node

Con yarn:

yarn install
yarn global add nodemon ts-node

Variables de entorno .env

Configura las siguientes variables en un archivo .env en la raíz del proyecto, toma en cuenta los ejemplos en .example.env y crea tu archivo .env:

PORT= # Puerto en el que se ejecutará el servidor
JWT_SECRET= # Clave secreta para la autenticación JWT
NODE_ENV=development # Entorno de ejecución (development, production)
ALLOWED_ORIGINS= # Orígenes permitidos para CORS
DBNAMES= # Nombre de la base de datos
DB_USER= # Usuario de la base de datos
DB_PASSWORD= # Contraseña de la base de datos (vacío por defecto)
DB_HOST= # Host de la base de datos
HOST_FRONT= # URL del frontend
EMAIL_ADDRESS= # Dirección de correo de notificaciones (SMTP)
EMAIL_PASSWORD= # Contraseña del correo de notificaciones

HOST=

Lanzar el servidor

Modo desarrollo:

nodemon app.ts

Base de datos

Asegúrate de que la base de datos esté en línea con XAMPP antes de ejecutar el backend.

Generar modelos con Sequelize Auto

Para generar modelos automáticamente desde la base de datos usando sequelize-auto, sigue estos pasos:

Instalar sequelize-auto si no lo tienes:

npm install sequelize-auto typescript --save-dev

Generar modelos automáticamente:

Con npx:

npx sequelize-auto -h pruebas.septlaxcala.gob.mx -d promette_dev -u uset_dev -x "1209sistems%&43" -p 3306 --dialect mysql -o ./models/modelsPromette --lang ts --additional ./config/additional-options.json

Con yarn:

yarn sequelize-auto -h localhost -d promette -u root -p 3306 --dialect mysql -o ./models/modelsPromette --lang ts

Este comando conectará a la base de datos y generará los modelos en la carpeta models.
