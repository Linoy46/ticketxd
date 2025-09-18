import { Injectable } from '@angular/core';

/**
 * Servicio de utilidades para el módulo de inventarios
 * Contiene funciones de transformación de datos específicas para este módulo
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryUtilsService {
  constructor() {}

  /**
   * Formatea una fecha para mostrar en formato local
   * @param dateString Fecha en formato ISO string
   * @returns Fecha formateada (DD/MM/YYYY)
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString || 'Fecha no disponible';
    }
  }

  /**
   * Formatea un nombre completo de partida (clave + nombre)
   * @param clave Clave de la partida
   * @param nombre Nombre de la partida
   * @returns Texto formateado
   */
  formatPartidaName(clave: string, nombre: string): string {
    if (!clave && !nombre) return 'No asignada';
    if (!clave) return nombre;
    if (!nombre) return clave;
    return `${clave} - ${nombre}`;
  }

  /**
   * Normaliza nombres de campos entre diferentes fuentes de datos
   * @param item Elemento a normalizar
   * @param fieldMappings Mapa de campos a normalizar {nuevoNombre: [posiblesNombresOriginales]}
   * @returns Objeto con campos normalizados
   */
  normalizeFields(item: any, fieldMappings: Record<string, string[]>): any {
    if (!item) return {};

    const result: any = { ...item };

    Object.entries(fieldMappings).forEach(([targetField, sourceFields]) => {
      // Si ya existe el campo destino con valor, lo dejamos
      if (result[targetField] !== undefined && result[targetField] !== null) {
        return;
      }

      // Buscamos en los posibles campos origen
      for (const sourceField of sourceFields) {
        if (result[sourceField] !== undefined && result[sourceField] !== null) {
          result[targetField] = result[sourceField];
          break;
        }
      }
    });

    return result;
  }
}
