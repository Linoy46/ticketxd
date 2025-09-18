import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { handleError } from '../../../../core/helpers/handle';

// Servicios internos del módulo
import { InventoryUtilsService } from './inventory-utils.service';

// Interfaces
import {
  Inventario,
  Partida,
  UnidadMedida,
  Factura,
} from '../interfaces/inventories.interface';

/**
 * Servicio para gestionar operaciones de inventario de consumibles
 */
@Injectable({
  providedIn: 'root',
})
export class InventoriesService {
  // URL base de la API
  private apiBase = environment.apiUrlPromette;

  // Endpoint principal para inventarios
  private resourceUrl = `${this.apiBase}/consumableInventory`;

  // Endpoints para entidades relacionadas
  private partidasEndpoint = `${this.apiBase}/item`;
  private unidadesEndpoint = `${this.apiBase}/measurementUnit`;
  private facturasEndpoint = `${this.apiBase}/consumableInvoice`;

  // Nombre del recurso para mensajes
  private resourceName = 'Inventario';

  constructor(
    private http: HttpClient,
    private alertService: CoreAlertService,
    private utils: InventoryUtilsService
  ) {}

  /**
   * Obtiene el inventario completo
   */
  getInventario(): Observable<Inventario[]> {
    return this.http.get<any>(this.resourceUrl).pipe(
      map((response) => {
        return (response.inventories || []).map((item: any) =>
          this.normalizeInventoryItem(item)
        );
      }),
      catchError((error) => {
        if (error.status === 404) {
          return of([]);
        }
        return handleError(
          error,
          this.alertService,
          `Error al cargar ${this.resourceName}`
        );
      })
    );
  }

  /**
   * Obtiene un elemento de inventario por su ID
   */
  getInventarioById(id: number): Observable<Inventario> {
    return this.http.get<any>(`${this.resourceUrl}/${id}`).pipe(
      map((response) => {
        return this.normalizeInventoryItem(response.inventory || {});
      }),
      catchError((error) => {
        if (error.status === 404) {
          this.alertService.warning(
            `El ${this.resourceName} solicitado no existe`
          );
        }
        return handleError(
          error,
          this.alertService,
          `Error al cargar detalle de ${this.resourceName}`
        );
      })
    );
  }

  /**
   * Crea un nuevo elemento de inventario
   */
  createInventario(data: any): Observable<Inventario> {
    const payload = this.preparePayload(data);

    return this.http.post<any>(this.resourceUrl, payload).pipe(
      map((response) => {
        this.alertService.success(
          `${this.resourceName} registrado correctamente`
        );
        return this.normalizeInventoryItem(response.inventory);
      }),
      catchError((error) => this.handleCreateError(error))
    );
  }

  /**
   * Actualiza un elemento de inventario existente
   */
  updateInventario(id: number, data: any): Observable<Inventario> {
    const payload = this.preparePayload(data);

    return this.http.put<any>(`${this.resourceUrl}/${id}`, payload).pipe(
      map((response) => {
        this.alertService.success(
          `${this.resourceName} actualizado correctamente`
        );
        return this.normalizeInventoryItem(response.inventory);
      }),
      catchError((error) => {
        if (error.status === 400) {
          if (
            error.error?.msg?.includes('cantidad') ||
            error.error?.msg?.includes('reducir')
          ) {
            return handleError(
              error,
              this.alertService,
              'No se puede reducir la cantidad por debajo de lo que ya se ha entregado'
            );
          }
        }
        return handleError(
          error,
          this.alertService,
          `Error al actualizar ${this.resourceName}`
        );
      })
    );
  }

  /**
   * Elimina un elemento de inventario
   */
  deleteInventario(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`).pipe(
      map(() => {
        this.alertService.success(
          `${this.resourceName} eliminado correctamente`
        );
        return true;
      }),
      catchError((error) => {
        if (error.status === 400 && error.error?.msg?.includes('entregas')) {
          return handleError(
            error,
            this.alertService,
            'No se puede eliminar porque tiene entregas asociadas'
          );
        }
        return handleError(
          error,
          this.alertService,
          `Error al eliminar ${this.resourceName}`
        );
      })
    );
  }

  /**
   * Normaliza un elemento de inventario para el frontend
   */
  private normalizeInventoryItem(item: any): Inventario {
    if (!item) return {} as Inventario;

    return this.utils.normalizeFields(item, {
      id_inventario: ['id_inventario'],
      folio: ['folio'],
      descripcion: ['descripcion', 'description'],
      description: ['descripcion', 'description'],
      observaciones: ['observaciones'],
      cantidad: ['cantidad', 'quantity'],
      resta: ['resta'],
      ct_partida_id: ['ct_partida_id', 'id_partida'],
      id_partida: ['ct_partida_id', 'id_partida'],
      ct_unidad_id: ['ct_unidad_id', 'id_unidad_medida'],
      id_unidad_medida: ['ct_unidad_id', 'id_unidad_medida'],
      ct_factura_id: ['ct_factura_id', 'id_factura'],
      id_factura: ['ct_factura_id', 'id_factura'],
      ct_partida: ['ct_partida'],
      ct_unidad: ['ct_unidad'],
      ct_factura: ['ct_factura'],
      createdAt: ['createdAt', 'fecha_in'],
      updatedAt: ['updatedAt', 'fecha_at'],
      fecha_in: ['createdAt', 'fecha_in'],
      fecha_at: ['updatedAt', 'fecha_at'],
    }) as Inventario;
  }

  /**
   * Prepara el payload para crear/actualizar
   */
  private preparePayload(data: any): any {
    return {
      folio: data.folio,
      descripcion: data.descripcion || data.description || '',
      observaciones: data.observaciones || '',
      cantidad: data.cantidad,
      ct_partida_id: data.ct_partida_id || data.id_partida,
      ct_unidad_id: data.ct_unidad_id || data.id_unidad_medida,
      ct_factura_id: data.ct_factura_id || data.id_factura,
      fecha: data.fecha // Agregar la fecha al payload
    };
  }

  /**
   * Manejo especializado de errores al crear
   */
  private handleCreateError(error: any): Observable<never> {
    if (error.status === 400) {
      if (error.error?.msg?.includes('folio')) {
        return handleError(
          error,
          this.alertService,
          'Ya existe un inventario con ese folio'
        );
      }
      if (error.error?.msg?.includes('unidad')) {
        return handleError(
          error,
          this.alertService,
          'La unidad de medida especificada no existe'
        );
      }
      if (error.error?.msg?.includes('partida')) {
        return handleError(
          error,
          this.alertService,
          'La partida especificada no existe'
        );
      }
      if (error.error?.msg?.includes('factura')) {
        return handleError(
          error,
          this.alertService,
          'La factura especificada no existe'
        );
      }
    }

    return handleError(
      error,
      this.alertService,
      `Error al crear ${this.resourceName}`
    );
  }

  /**
   * Obtiene los datos procesados para mostrar en tabla
   */
  getInventarioDisplayData(inventoryData: Inventario[]): Observable<any[]> {
    if (!inventoryData || inventoryData.length === 0) {
      return of([]);
    }

    return of(inventoryData.map((item) => this.mapInventoryToDisplay(item)));
  }

  /**
   * Mapea un item de inventario a formato para visualización
   * Quita el cuarto caracter de clavePartida para la interfaz
   */
  private mapInventoryToDisplay(item: Inventario): any {
    let partidaText = 'No asignada';
    if (item.ct_partida) {
      let clavePartidaOriginal = item.ct_partida.clave_partida || item.ct_partida.clave || '';
      // Quitar el cuarto caracter de clavePartida para la interfaz
      let clavePartidaSinCuartoCaracter = '';
      if (clavePartidaOriginal.length >= 5) {
        clavePartidaSinCuartoCaracter = clavePartidaOriginal.slice(0, 3) + clavePartidaOriginal.slice(4);
      } else {
        clavePartidaSinCuartoCaracter = clavePartidaOriginal;
      }
      const nombrePartida =
        item.ct_partida.nombre_partida || item.ct_partida.nombre || '';
      partidaText = this.utils.formatPartidaName(clavePartidaSinCuartoCaracter, nombrePartida);
    }

    let unitText = 'No asignada';
    if (item.ct_unidad) {
      unitText = item.ct_unidad.clave_unidad || item.ct_unidad.clave || '';
    }

    return {
      id: item.id_inventario,
      folio: item.folio,
      description: item.descripcion || item.description || '',
      observaciones: item.observaciones || '',
      quantity: item.cantidad, // Cantidad original
      available: item.resta, // Cantidad disponible actual
      used: item.cantidad - (item.resta ?? 0), // Cantidad utilizada
      partida: partidaText,
      unit: unitText,
      invoice: item.ct_factura ? item.ct_factura.factura : 'No asignada',
      date: this.utils.formatDate(item.createdAt || item.updatedAt),
    };
  }

  /**
   * Obtiene todas las partidas excluyendo las que tienen claves entre 3000-3999
   * Quita el cuarto caracter de clave_partida para la interfaz
   */
  getPartidas(): Observable<Partida[]> {
    return this.http.get<any>(this.partidasEndpoint).pipe(
      map((response) => {
        let partidas: Partida[] = [];

        if (response?.items && Array.isArray(response.items)) {
          partidas = response.items;
        } else if (Array.isArray(response)) {
          partidas = response;
        }

        // Filtrar partidas para mostrar únicamente las claves permitidas y eliminar el 4to caracter en la clave
        const clavesPermitidas = [
          '21101','21201','21401','21601','21701','22101','23901','24601',
          '24701','25201','25401','25601','27101','29101','29201','29401','41101'
        ];
        return partidas
          .filter((partida) => {
            if (!partida || !partida.clave_partida) return false;
            // Solo incluir si la clave_partida está en la lista permitida
            return clavesPermitidas.includes(partida.clave_partida);
          })
          .map((item) => {
            // Eliminar el 4to caracter de la clave_partida para mostrarlo en la interfaz
            let claveOriginal = item.clave_partida || '';
            let claveSinCuartoCaracter = '';
            if (claveOriginal.length >= 5) {
              claveSinCuartoCaracter = claveOriginal.slice(0, 3) + claveOriginal.slice(4);
            } else {
              claveSinCuartoCaracter = claveOriginal;
            }
            return {
              id_partida: item.id_partida,
              clave: claveSinCuartoCaracter,
              nombre: item.nombre_partida || '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          });
      }),
      catchError((error) =>
        handleError(error, this.alertService, 'Error al cargar partidas')
      )
    );
  }

  /**
   * Obtiene todas las unidades de medida
   */
  getUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<any>(this.unidadesEndpoint).pipe(
      map((response) =>
        (response?.units || []).map((unit: any) => ({
          id_unidad: unit.id_unidad,
          id_unidad_medida: unit.id_unidad,
          clave: unit.clave_unidad || '',
          nombre_unidad: unit.nombre_unidad || '',
          createdAt: unit.createdAt,
          updatedAt: unit.updatedAt,
        }))
      ),
      catchError((error) =>
        handleError(
          error,
          this.alertService,
          'Error al cargar unidades de medida'
        )
      )
    );
  }

  /**
   * Obtiene todas las facturas
   */
  getFacturas(): Observable<Factura[]> {
    return this.http.get<any>(this.facturasEndpoint).pipe(
      map((response) => response.invoices || []),
      catchError((error) =>
        handleError(error, this.alertService, 'Error al cargar facturas')
      )
    );
  }

  /**
   * Carga todos los datos para menús desplegables
   */
  getFormDropdownData(): Observable<{
    partidas: Partida[];
    unidades: UnidadMedida[];
    facturas: Factura[];
  }> {
    return forkJoin({
      partidas: this.getPartidas(),
      unidades: this.getUnidadesMedida(),
      facturas: this.getFacturas(),
    });
  }
}
