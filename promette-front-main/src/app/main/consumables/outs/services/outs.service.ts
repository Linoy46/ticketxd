import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs'; // Add throwError here
import { delay, catchError, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { handleError } from '../../../../core/helpers/handle';
import {
  RegistroSalida,
  DireccionResponse,
  DepartamentoResponse,
  FacturaResponse,
  PartidaResponse,
  EntregaFormatoInput,
  EntregaFormatoResponse,
  EntregaFormatosResponse,
} from '../interfaces/outs.interface';

// Import required interfaces from the inventories module
import {
  Inventario,
  Factura,
  Partida,
} from '../../inventories/interfaces/inventories.interface';

/**
 * Servicio para gestionar las operaciones de salidas de inventario
 * @description Maneja todas las comunicaciones con el backend relacionadas con salidas de inventario
 */
@Injectable({
  providedIn: 'root',
})
export class OutsService {
  private apiUrlPromette = environment.apiUrlPromette;

  // Endpoints para las operaciones de salidas
  private apiBase = this.apiUrlPromette;
  private inventarioEndpoint = `${this.apiBase}/consumableInventory`;
  private direccionesEndpoint = `${this.apiBase}/consumableDirection`;
  private departamentosEndpoint = `${this.apiBase}/consumableDepartment`;
  private partidasEndpoint = `${this.apiBase}/item`;
  private unidadesEndpoint = `${this.apiBase}/measurementUnit`;
  private facturasEndpoint = `${this.apiBase}/consumableInvoice`;
  private entregasEndpoint = `${this.apiBase}/consumableDelivery`;
  private formatosEndpoint = `${this.apiBase}/entregaFormato`;

  // ID del usuario actual (en una aplicación real, esto vendría del servicio de autenticación)
  private currentUserId: number | null = null; // <-- inicia como null

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  /**
   * Obtiene el catálogo de direcciones
   * @returns Observable con la lista de direcciones
   */
  getAllDirections(): Observable<any> {
    this.loading.show();
    return this.http.get<DireccionResponse>(`${this.direccionesEndpoint}`).pipe(
      map((response) => response.directions || []),
      tap(() => this.loading.hide()),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al cargar direcciones'
        );
      })
    );
  }

  /**
   * Obtiene los detalles de una dirección específica
   * @param id_direccion ID de la dirección a consultar
   * @returns Observable con los detalles de la dirección
   */
  getDirectionById(id_direccion: number): Observable<any> {
    this.loading.show();
    return this.http
      .get<any>(`${this.direccionesEndpoint}/${id_direccion}`)
      .pipe(
        map((response) => response.direction || {}),
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener la dirección'
          );
        })
      );
  }

  /**
   * Obtiene el catálogo de departamentos
   * @param directionId ID de la dirección para filtrar departamentos (opcional)
   * @returns Observable con la lista de departamentos
   */
  getAllDepartments(directionId?: number): Observable<any> {
    this.loading.show();

    let params = new HttpParams();
    if (directionId) {
      params = params.set('directionId', directionId.toString());
    }

    return this.http
      .get<DepartamentoResponse>(`${this.departamentosEndpoint}`, { params })
      .pipe(
        map((response) => response.departments || []),
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al cargar departamentos'
          );
        })
      );
  }

  /**
   * Obtiene los detalles de un departamento
   * @param id_departamento ID del departamento a consultar
   * @returns Observable con los detalles del departamento
   */
  getDepartmentById(id_departamento: number): Observable<any> {
    this.loading.show();
    return this.http
      .get<any>(`${this.departamentosEndpoint}/${id_departamento}`)
      .pipe(
        map((response) => response.department || {}),
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener el departamento'
          );
        })
      );
  }

  /**
   * Obtiene la lista de facturas disponibles
   * @returns Observable con la lista de facturas
   */
  getAllFacturas(): Observable<Factura[]> {
    this.loading.show();
    return this.http.get<FacturaResponse>(`${this.facturasEndpoint}`).pipe(
      map((response) => response.invoices || []),
      tap(() => this.loading.hide()),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al cargar facturas'
        );
      })
    );
  }

  /**
   * Obtiene todas las partidas
   * @returns Observable con el listado de partidas
   */
  getAllPartidas(): Observable<Partida[]> {
    this.loading.show();
    return this.http.get<PartidaResponse>(`${this.partidasEndpoint}`).pipe(
      map((response) => {
        const items = response.items || [];
        // Map items to match the Partida interface properties correctly
        return items.map((item) => ({
          id_partida: item.id_partida,
          clave: item.clave_partida || '',
          nombre: item.nombre_partida || '',
          // Add other properties as needed by the Partida interface
          estado: item.estado,
        }));
      }),
      tap(() => this.loading.hide()),
      catchError((error) =>
        handleError(error, this.alertService, 'Error al cargar partidas')
      )
    );
  }

  /**
   * Método para cargar todo el inventario disponible
   * @returns Observable con el listado completo de inventario
   */
  getAllInventory(): Observable<Inventario[]> {
    this.loading.show();
    return this.http.get<any>(this.inventarioEndpoint).pipe(
      map((response) => {
        const inventories = response.inventories || [];

        // Asegurarse de que todos los productos tengan la estructura correcta
        return inventories.map((item: any) => {
          // Normalizar los IDs de partida para asegurar compatibilidad
          if (item.ct_partida_id && !item.id_partida) {
            item.id_partida = item.ct_partida_id;
          } else if (item.id_partida && !item.ct_partida_id) {
            item.ct_partida_id = item.id_partida;
          }

          // Asegurarse que la cantidad disponible sea un número
          // Algunos registros usan "resta" en lugar de "cantidad"
          if (typeof item.resta !== 'undefined' && item.resta !== null) {
            item.cantidad =
              typeof item.resta === 'number'
                ? item.resta
                : parseInt(item.resta.toString(), 10);
          } else if (!item.cantidad) {
            item.cantidad = 0;
          }

          // Asegurarse que description esté disponible para compatibilidad
          if (!item.description && item.descripcion) {
            item.description = item.descripcion;
          } else if (!item.descripcion && item.description) {
            item.descripcion = item.description;
          }

          return item;
        });
      }),
      tap((data) => {
        console.log(`Inventario cargado (${data.length} items)`);
        console.log('Muestra de inventario:', data.slice(0, 3));
        this.loading.hide();
      }),
      catchError((error) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al cargar inventario'
        );
      })
    );
  }

  /**
   * Obtiene el ID del usuario current (autenticado)
   * En una aplicación real, esto vendría del servicio de autenticación
   */
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  /**
   * Establece el ID del usuario current (para pruebas o autenticación)
   */
  setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
  }

  /**
   * Registra una nueva salida de inventario y actualiza las cantidades
   * @param data Datos de la salida de inventario
   * @returns Observable con la respuesta del servidor
   */
  registerInventoryExit(data: RegistroSalida): Observable<any> {
    this.loading.show();
    console.log('[OutsService] Registrando salida de inventario:', data);

    // Para cada producto, creamos una petición de entrega separada
    const requests = data.productos.map((producto) => {
      // Verificamos que el producto tenga la información de unidad_id
      if (!producto.ct_unidad_id) {
        console.error('Producto sin unidad_id:', producto);
        return of(null); // Saltar este producto si no tiene unidad_id
      }

      // Creamos el objeto de entrega según la estructura esperada por el backend
      const entregaPayload = {
        ct_area_id: data.id_area,
        dt_inventario_id: producto.id_inventario,
        ct_unidad_id: producto.ct_unidad_id,
        cantidad: producto.cantidad,
        ct_usuario_id: this.currentUserId, // <-- ahora sí será el usuario real
        observaciones: data.observaciones || undefined,
      };

      // Realizamos la petición POST para crear la entrega
      return this.http.post<any>(`${this.entregasEndpoint}`, entregaPayload);
    });

    // Utilizamos forkJoin para ejecutar todas las peticiones en paralelo
    return forkJoin(requests.filter((req) => req !== null)).pipe(
      map((responses) => {
        // Devolvemos los IDs de entregas creadas y otros datos útiles
        const entregaIds = responses
          .map((resp) => resp?.delivery?.id_entrega)
          .filter((id) => id);

        return {
          success: true,
          message: 'Salida de inventario registrada correctamente',
          data: {
            entregas_ids: entregaIds,
            total_entregas: entregaIds.length,
            fecha_registro: new Date().toISOString(),
          },
        };
      }),
      tap(() => this.loading.hide()),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al registrar la salida de inventario'
        );
      })
    );
  }

  /**
   * Crea un nuevo formato de entrega que agrupa múltiples entregas
   * @param formatoData Datos del formato a crear
   * @returns Observable con la respuesta del servidor
   */
  createEntregaFormato(
    formatoData: EntregaFormatoInput
  ): Observable<EntregaFormatoResponse> {
    this.loading.show();
    console.log('[OutsService] Creando formato de entrega:', formatoData);

    return this.http
      .post<EntregaFormatoResponse>(`${this.formatosEndpoint}`, formatoData)
      .pipe(
        tap((response) => console.log('Formato creado:', response)),
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al crear formato de entrega'
          );
        })
      );
  }

  /**
   * Obtiene todos los formatos de entrega
   */
  getAllFormatosEntrega(): Observable<EntregaFormatosResponse> {
    this.loading.show();

    return this.http
      .get<EntregaFormatosResponse>(`${this.formatosEndpoint}`)
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener formatos de entrega'
          );
        })
      );
  }

  /**
   * Obtiene un formato de entrega por su ID
   * @param id ID del formato a obtener
   */
  getFormatoEntregaById(id: number): Observable<EntregaFormatoResponse> {
    this.loading.show();

    return this.http
      .get<EntregaFormatoResponse>(`${this.formatosEndpoint}/${id}`)
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener el formato de entrega'
          );
        })
      );
  }

  /**
   * Obtiene el historial de salidas de inventario
   * @param params Parámetros opcionales para filtrado
   * @returns Observable con el historial de salidas
   */
  getInventoryOuts(params?: any): Observable<any[]> {
    this.loading.show();

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http
      .get<{ deliveries: any[] }>(`${this.entregasEndpoint}`, {
        params: httpParams,
      })
      .pipe(
        map((response) => response.deliveries || []),
        tap(() => this.loading.hide()),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(
            error,
            this.alertService,
            'Error al obtener historial de salidas'
          );
        })
      );
  }

  /**
   * Genera el PDF para un formato de entrega específico
   * @param folioFormato Folio del formato de entrega
   * @returns Observable con el PDF como Blob
   */
  generateEntregaPDF(folioFormato: string): Observable<Blob> {
    // Construir la URL para descargar el PDF
    const pdfUrl = `${this.apiBase}/pdf/entrega-materiales/${folioFormato}`;

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
}
