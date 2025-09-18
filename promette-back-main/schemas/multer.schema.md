# Documentación de Configuración de Multer en Promette

## Descripción

Multer es un middleware para Express diseñado para manejar datos de formularios `multipart/form-data`, que se usa principalmente para subir archivos.
En Promette, se ha implementado una configuración extensible para organizar los archivos subidos según el módulo y tipo de documento.

## Variables de entorno

Para configurar correctamente Multer, debes establecer estas variables en tu archivo `.env`:

```
# Ruta base donde se almacenarán las subidas (absoluta)
UPLOADS_PATH=/ruta/absoluta/a/carpeta/promette-uploads

# URL base para acceder a los archivos (incluye puerto si es necesario)
API_URL=http://tu-dominio:puerto
```

## Ejemplo de uso básico

### 1. En una ruta de API

```typescript
import { Router } from "express";
import { uploadFor } from "../middlewares/upload.md";
import { handleUpload } from "../helpers/upload.helper";

const router = Router();

// Ruta para subir un documento
router.post(
  "/upload-documento/:id",
  uploadFor("consumables", {
    documentType: "formatos-salida",
    idField: "id",
  }),
  (req, res) => {
    try {
      const uploadResult = handleUpload(req);
      res.status(200).json({
        success: true,
        message: "Archivo subido correctamente",
        data: uploadResult,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
```

### 2. Opciones de configuración para `uploadFor`

```typescript
interface UploadOptions {
  fieldName?: string; // Nombre del campo del formulario (default: 'file')
  documentType?: string | ((req: Request) => string); // Subcarpeta o función que la determina
  idField?: string; // Campo en req.params o req.body que contiene el ID
}
```

### 3. Accediendo a archivos desde el frontend

Para obtener la URL de un documento almacenado:

```typescript
import { getDocumentUrl } from "../helpers/upload.helper";

// Si tienes la ruta relativa del documento en la base de datos
const documentoUrl = getDocumentUrl(documento.path);
```

## Estructura de carpetas resultante

Los archivos se organizarán siguiendo esta estructura:

```
UPLOADS_PATH/
  ├── modulo1/
  │   ├── tipo-documento1/
  │   │   ├── id1.pdf
  │   │   └── id2.jpg
  │   └── tipo-documento2/
  │       └── id3.png
  └── modulo2/
      └── ...
```

## Tipos de archivos permitidos

- PDF (.pdf)
- Imágenes (.jpg, .jpeg, .png)

## Límites

- Tamaño máximo: 5MB por archivo
