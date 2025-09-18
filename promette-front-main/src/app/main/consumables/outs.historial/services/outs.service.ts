import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { handleError } from '../../../../core/helpers/handle';

import {
  SalidaHistorial,
  FiltrosHistorial,
  EntregaFormato,
  DetalleSalida,
  BackendDelivery,
  InventarioBackend,
} from '../interfaces/historial.interface';

// Importamos interfaces existentes o las definimos si no existen
export interface DocumentCheckResponse {
  success: boolean;
  hasDocument: boolean;
  folio_formato: string;
  documentInfo?: {
    path: string;
    name: string;
  };
  message?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data?: {
    path: string;
    replaced: boolean;
    originalName: string;
    folio_formato: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OutsHistorialService {
  uploadFormatoDocument(arg0: string, file: File) {
    throw new Error('Method not implemented.');
  }
  private apiBase = environment.apiUrlPromette;
  private entregasEndpoint = `${this.apiBase}/consumableDelivery`;
  private formatosEndpoint = `${this.apiBase}/entregaFormato`;
  private pdfEndpoint = `${this.apiBase}/pdf`;

  // Cache para los datos del historial
  private cachedData = new BehaviorSubject<SalidaHistorial[]>([]);
  private dataLoaded = false;

  constructor(
    private http: HttpClient,
    private alertService: CoreAlertService,
    private loading: CoreLoadingService
  ) {}

  /**
   * Inicializa el caché si está vacío
   */

  /**
   * Obtiene los formatos de entrega con información agregada
   * @param filtros - Filtros opcionales para la consulta
   * @returns Observable con los formatos procesados
   */
  getFormatosEntrega(filtros?: FiltrosHistorial): Observable<EntregaFormato[]> {
    this.loading.show();

    // Construir parámetros para la consulta
    let params = new HttpParams();
    if (filtros?.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    if (filtros?.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    if (filtros?.departamento) {
      params = params.set('departamento', filtros.departamento.toString());
    }
    if (filtros?.usuario) {
      params = params.set('usuario', filtros.usuario.toString());
    }

    // Usar la ruta específica para el historial
    return this.http
      .get<{ formatos: EntregaFormato[] }>(
        `${this.formatosEndpoint}/historial`,
        { params }
      )
      .pipe(
        map((response) => {
          if (
            !response ||
            !response.formatos ||
            !Array.isArray(response.formatos)
          ) {
            return [];
          }

          // Procesar cada formato para asegurar que tenga todos los campos necesarios
          return response.formatos.map((formato) => {
            return {
              ...formato,
              // Asegurar que estos campos estén presentes y sean válidos
              departamento_nombre:
                formato.departamento_nombre || 'No especificado',
              usuario_nombre: formato.usuario_nombre || 'No especificado',
              cantidadTotal:
                typeof formato.cantidadTotal === 'number'
                  ? formato.cantidadTotal
                  : 0,
            };
          });
        }),
        catchError((error) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener formatos de entrega'
          );
        }),
        tap(() => this.loading.hide())
      );
  }

  /**
   * Obtiene el historial de salidas de inventario con los filtros especificados
   */
  getHistorialSalidas(
    filtros?: FiltrosHistorial
  ): Observable<SalidaHistorial[]> {
    this.loading.show();

    // Construir parámetros para la consulta
    let params = new HttpParams();
    if (filtros?.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    if (filtros?.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    if (filtros?.departamento) {
      params = params.set('departamento', filtros.departamento.toString());
    }
    if (filtros?.folio) {
      params = params.set('folio', filtros.folio);
    }
    if (filtros?.usuario) {
      params = params.set('usuario', filtros.usuario.toString());
    }

    return this.http
      .get<{ deliveries: BackendDelivery[] }>(`${this.entregasEndpoint}`, {
        params,
      })
      .pipe(
        map((response) => {
          // Procesando los datos recibidos para el formato de historial
          const salidas = (response.deliveries || []).map((delivery) =>
            this.mapDeliveryToSalida(delivery)
          );

          // Actualizar el caché si no hay filtros
          if (!filtros || Object.keys(filtros).length === 0) {
            this.cachedData.next(salidas);
            this.dataLoaded = true;
          }

          return salidas;
        }),
        catchError((error) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener historial de salidas'
          );
        }),
        tap(() => this.loading.hide())
      );
  }

  /**
   * Obtiene los detalles de una salida específica
   */
  getDetalleSalida(id: number): Observable<SalidaHistorial> {
    this.loading.show();

    return this.http
      .get<{ delivery: BackendDelivery }>(`${this.entregasEndpoint}/${id}`)
      .pipe(
        map((response) => {
          const delivery = response.delivery;
          if (!delivery) {
            throw new Error('No se encontraron datos de la salida');
          }

          // Mapear la entrega principal
          const salida = this.mapDeliveryToSalida(delivery);

          // Si hay un formato asociado, obtener todas las entregas del formato
          if (delivery.folio_formato) {
            return this.getEntregasPorFormato(delivery.folio_formato).pipe(
              map((entregas) => {
                // Crear los detalles a partir de todas las entregas del formato
                const detalles: DetalleSalida[] = entregas.map((entrega) => ({
                  producto_id: entrega.dt_inventario?.id_inventario || 0,
                  producto_folio: entrega.dt_inventario?.folio || '',
                  descripcion:
                    entrega.dt_inventario?.descripcion ||
                    entrega.dt_inventario?.description ||
                    '',
                  partida: this.getPartidaText(
                    entrega.dt_inventario?.ct_partida
                  ),
                  unidad:
                    entrega.unidad_medida?.clave ||
                    entrega.unidad_medida?.clave_unidad ||
                    '',
                  cantidad: entrega.cantidad,
                  fecha: entrega.createdAt,
                }));

                // Agregar los detalles a la salida
                return {
                  ...salida,
                  detalles: detalles,
                };
              })
            );
          } else {
            // Si no hay formato, crear un detalle para esta entrega individual
            const detalle: DetalleSalida = {
              producto_id: delivery.dt_inventario?.id_inventario || 0,
              producto_folio: delivery.dt_inventario?.folio || '',
              descripcion:
                delivery.dt_inventario?.descripcion ||
                delivery.dt_inventario?.description ||
                '',
              partida: this.getPartidaText(delivery.dt_inventario?.ct_partida),
              unidad:
                delivery.unidad_medida?.clave ||
                delivery.unidad_medida?.clave_unidad ||
                '',
              cantidad: delivery.cantidad,
              fecha: delivery.createdAt,
            };

            // Retornar la salida con el único detalle
            return {
              ...salida,
              detalles: [detalle],
            };
          }
        }),
        catchError((error) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener detalles de la salida'
          );
        }),
        tap(() => this.loading.hide())
      ) as Observable<SalidaHistorial>;
  }

  /**
   * Obtiene todas las entregas asociadas a un formato
   */
  private getEntregasPorFormato(
    folio_formato: string
  ): Observable<BackendDelivery[]> {
    return this.http
      .get<{ deliveries: BackendDelivery[] }>(
        `${this.entregasEndpoint}?folio_formato=${folio_formato}`
      )
      .pipe(
        map((response) => response.deliveries || []),
        catchError((error) => {
          return handleError(
            error,
            this.alertService,
            'Error al obtener entregas del formato'
          );
        })
      );
  }

  /**
   * Genera el PDF para un formato de entrega específico
   */
  generateEntregaPDF(folioFormato: string): Observable<Blob> {
    // Construir la URL para descargar el PDF
    const pdfUrl = `${this.pdfEndpoint}/entrega-materiales/${folioFormato}`;

    // Obtener el token de autenticación actual
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    // Configurar los encabezados con autenticación
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    // Realizar la petición HTTP para obtener el PDF como Blob
    return this.http
      .get(pdfUrl, {
        responseType: 'blob',
        headers,
      })
      .pipe(
        catchError((error) => {
          this.alertService.error('Error al generar el PDF');
          return throwError(() => new Error('Error al generar el PDF'));
        })
      );
  }

  /**
   * Verifica si un formato tiene un documento asociado
   */
  checkFormatoDocument(
    folioFormato: string
  ): Observable<DocumentCheckResponse> {
    return this.http.get<DocumentCheckResponse>(
      `${this.entregasEndpoint}/formato/${folioFormato}/check-documento`
    );
  }

  /**
   * Obtiene un documento de un formato de entrega
   */
  getFormatoDocument(folioFormato: string): Observable<Blob> {
    return this.http.get(
      `${this.entregasEndpoint}/formato/${folioFormato}/documento`,
      {
        responseType: 'blob',
      }
    );
  }

  /**
   * Mapea una entrega a formato SalidaHistorial
   */
  private mapDeliveryToSalida(delivery: BackendDelivery): SalidaHistorial {
    // Extraer datos de la entrega
    const departamento =
      delivery.ct_departamento?.nombre_departamento || 'No especificado';
    const id_departamento = delivery.ct_departamento?.id_departamento || 0;
    const usuario =
      delivery.usuario_entrega?.nombre_usuario || 'No especificado';
    const id_usuario = delivery.usuario_entrega?.id_usuario || 0;

    // Asegurar que inventario sea un objeto válido
    const emptyInventory: InventarioBackend = {
      id_inventario: 0,
      folio: '',
      descripcion: '',
      ct_partida: { id_partida: 0 },
    };

    const inventario = delivery.dt_inventario || emptyInventory;

    const unidad =
      delivery.unidad_medida?.clave ||
      delivery.unidad_medida?.clave_unidad ||
      'N/A';

    // Crear objeto de salida con la estructura deseada
    return {
      id: delivery.id_entrega,
      folio: delivery.folio || '',
      fecha: delivery.createdAt,
      departamento: departamento,
      id_departamento: id_departamento,
      cantidad: delivery.cantidad,
      usuario: usuario,
      id_usuario: id_usuario,
      unidad: unidad,
      producto: {
        id: inventario.id_inventario || 0,
        folio: inventario.folio || '',
        descripcion: inventario.descripcion || inventario.description || '',
        partida: this.getPartidaText(inventario.ct_partida),
      },
      folio_formato: delivery.folio_formato || null,
    };
  }

  /**
   * Obtiene el texto formateado de la partida
   */
  private getPartidaText(partida?: any): string {
    if (!partida) return 'No especificada';

    const clave = partida.clave || partida.clave_partida || '';
    const nombre = partida.nombre || partida.nombre_partida || '';

    return clave ? `${clave} - ${nombre}` : nombre;
  }

  /**
   * Prepara los datos para generar el PDF
   */
  getPdfData(salida: SalidaHistorial): any {
    // Datos para la tabla
    const tableData =
      salida.detalles?.map((detalle: DetalleSalida) => ({
        productoId: detalle.producto_id,
        folio: detalle.producto_folio,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        unidad: detalle.unidad,
        fecha: new Date(detalle.fecha).toLocaleDateString('es-MX'),
      })) || [];

    // Configuración para el PDF
    return {
      title: `Detalle de Salida: ${salida.folio}`,
      data: {
        departamento: salida.departamento,
        fecha: new Date(salida.fecha).toLocaleDateString('es-MX'),
        usuario: salida.usuario,
        folio: salida.folio,
        totalItems: tableData.length,
        totalCantidad: tableData.reduce(
          (sum: number, item: any) => sum + item.cantidad,
          0
        ),
        items: tableData,
      },
      options: {
        fileName: `salida_${salida.folio.replace(/\s+/g, '_')}.pdf`,
        documentProperties: {
          title: `Detalle de Salida ${salida.folio}`,
          author: 'Sistema PROMETTE',
          subject: 'Detalle de Salida de Inventario',
          keywords: 'salida, inventario, promette',
        },
        signatureFields: [
          {
            label: 'Entregó',
            name: salida.usuario,
            sublabel: 'Responsable de Almacén',
          },
          {
            label: 'Recibió',
            name: 'Firma Responsable',
            sublabel: salida.departamento,
          },
        ],
      },
    };
  }

  /**
   * Función para inspeccionar la estructura de un objeto
   * y encontrar cualquier propiedad que contenga el nombre de departamento
   */
  private inspectObjectForDepartamento(obj: any, path: string = ''): string[] {
    const results: string[] = [];

    if (!obj || typeof obj !== 'object') {
      return results;
    }

    // Buscar propiedades relevantes
    if (obj.nombre_departamento) {
      results.push(`${path}.nombre_departamento = ${obj.nombre_departamento}`);
    }

    if (obj.nombre_departamento) {
      results.push(`${path}.nombre_departamento = ${obj.nombre_departamento}`);
    }

    // Recorrer todas las propiedades recursivamente
    for (const key in obj) {
      if (
        Object.prototype.hasOwnProperty.call(obj, key) &&
        obj[key] &&
        typeof obj[key] === 'object'
      ) {
        const nestedPath = path ? `${path}.${key}` : key;
        results.push(
          ...this.inspectObjectForDepartamento(obj[key], nestedPath)
        );
      }
    }

    return results;
  }
}
