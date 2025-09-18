import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface FileInfo {
  url: string;
  blob: Blob;
  filename: string;
  contentType: string;
  fileType: 'image' | 'pdf' | 'unknown';
}

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  private apiUrlRupeet = environment.apiUrlRupeet;

  constructor() { }

  // Método para extraer información de ruta del archivo
  parseFilePath(filePath: string): { id_informacion_rupeet: string, nombreArchivo: string } {
    console.log('Parseando ruta:', filePath);

    // Normalizar path (reemplazar barras invertidas por barras normales)
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Dividir la ruta por separadores
    const segments = normalizedPath.split('/');

    // El último segmento es el nombre del archivo
    const fullFileName = segments[segments.length - 1];

    // Obtener el nombre base sin extensión
    const nombreArchivo = fullFileName.split('.')[0];

    // Buscar el ID (normalmente está en el penúltimo directorio)
    let id_informacion_rupeet = '';

    // Busca un número que esté en un segmento de ruta
    for (let i = segments.length - 2; i >= 0; i--) {
      if (/^\d+$/.test(segments[i])) {
        id_informacion_rupeet = segments[i];
        break;
      }
    }

    // Si no se encontró, usar el primer número que se encuentre en toda la ruta
    if (!id_informacion_rupeet) {
      const idMatch = /\/(\d+)\//.exec(normalizedPath);
      if (idMatch) {
        id_informacion_rupeet = idMatch[1];
      }
    }

    console.log(`ID extraído: ${id_informacion_rupeet}, Nombre: ${nombreArchivo}`);
    return {
      id_informacion_rupeet,
      nombreArchivo
    };
  }

  // Construir URL de archivo basado en ID y nombre
  buildFileUrl(id_informacion_rupeet: string, nombreArchivo: string): string {
    return `${this.apiUrlRupeet}/uploadFiles/file/${id_informacion_rupeet}/${nombreArchivo}`;
  }

  // Detectar el tipo de archivo basado en el blob
  detectFileType(blob: Blob, filename: string): FileInfo {
    const contentType = blob.type;
    let fileType: 'image' | 'pdf' | 'unknown' = 'unknown';

    if (contentType.startsWith('image/')) {
      fileType = 'image';
    } else if (contentType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf';
    }

    return {
      url: URL.createObjectURL(blob),
      blob,
      filename,
      contentType,
      fileType
    };
  }

  // Crear configuración para el modal basado en el tipo de archivo
  createModalContent(fileInfo: FileInfo, title: string = 'Documento') {
    if (fileInfo.fileType === 'image') {
      return {
        component: null,
        title: title,
        imageUrl: fileInfo.url,
        pdfUrl: null,
        data: null,
        isHtml: false
      };
    } else if (fileInfo.fileType === 'pdf') {
      return {
        component: null,
        title: title,
        imageUrl: null,
        pdfUrl: fileInfo.url,
        data: null,
        isHtml: false
      };
    } else {
      // Para otros tipos de archivos
      return {
        component: null,
        title: 'Error',
        imageUrl: null,
        pdfUrl: null,
        data: { message: 'Formato de archivo no soportado' },
        isHtml: true
      };
    }
  }
}
