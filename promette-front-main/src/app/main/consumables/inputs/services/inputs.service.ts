import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Partida,
  UnidadMedida,
  Factura,
  Proveedor,
  Inventario,
} from '../interfaces/inputs.interface';

/**
 * Servicio para gestionar las operaciones relacionadas con las entradas de inventario
 */
@Injectable({
  providedIn: 'root',
})
export class InputsService {
  private baseUrl = environment.apiUrlPromette;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene información simplificada para los formularios (partidas y unidades)
   * @returns Observable con datos para formularios
   */
  getFormDataSimplified(): Observable<{
    partidas: Partida[];
    unidades: UnidadMedida[];
  }> {
    return forkJoin({
      partidas: this.getPartidas(),
      unidades: this.getUnidadesMedida(),
    }).pipe(
      catchError(() => {
        return of({ partidas: [], unidades: [] });
      })
    );
  }

  /**
   * Obtiene las partidas del sistema
   * @returns Observable con lista de partidas
   */
  private getPartidas(): Observable<Partida[]> {
    return this.http.get<any>(`${this.baseUrl}/item`).pipe(
      map((response) => {
        let partidas: Partida[] = [];

        if (response && response.items && Array.isArray(response.items)) {
          partidas = response.items;
        } else if (Array.isArray(response)) {
          partidas = response;
        } else {
          return [];
        }

        // Lista de claves permitidas
        const clavesPermitidas = [
          '21101','21201','21401','21601','21701','22101','23901','24601',
          '24701','25201','25401','25601','27101','29101','29201','29401','41101'
        ];

        // Filtrar y transformar partidas
        return partidas
          .filter((item) => {
            if (!item || !item.clave_partida) return false;
            return clavesPermitidas.includes(item.clave_partida);
          })
          .map((item) => {
            // Quitar el 4to caracter de la clave_partida para mostrarlo en la interfaz
            let claveOriginal = item.clave_partida || '';
            let claveSinCuartoCaracter = '';
            if (claveOriginal.length >= 5) {
              claveSinCuartoCaracter = claveOriginal.slice(0, 3) + claveOriginal.slice(4);
            } else {
              claveSinCuartoCaracter = claveOriginal;
            }
            return {
              ...item,
              clave_partida: claveSinCuartoCaracter
            };
          });
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene las unidades de medida
   * @returns Observable con lista de unidades de medida
   */
  private getUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<any>(`${this.baseUrl}/measurementUnit`).pipe(
      map((response) => {
        let unidades: UnidadMedida[] = [];

        if (response && response.units && Array.isArray(response.units)) {
          unidades = response.units;
        } else if (Array.isArray(response)) {
          unidades = response;
        }

        return unidades || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Crea un nuevo proveedor o recupera uno existente
   * @param proveedor Datos del proveedor
   * @returns Observable con información del proveedor
   */
  createProveedor(proveedor: { razon_social: string }): Observable<Proveedor> {
    return this.http
      .post<{ provider: Proveedor; msg: string; existing: boolean }>(
        `${this.baseUrl}/consumableProvider`,
        proveedor
      )
      .pipe(
        map((response) => response.provider),
        catchError((error) => {
          if (error.status === 400 && error.error?.existing) {
            return of(error.error.provider);
          }
          throw error;
        })
      );
  }

  /**
   * Crea una nueva factura
   * @param factura Datos de la factura
   * @returns Observable con información de la factura creada
   */
  createFactura(factura: {
    factura: string;
    ct_provedor_id: number;
  }): Observable<Factura> {
    return this.http
      .post<{ invoice: Factura; msg: string }>(
        `${this.baseUrl}/consumableInvoice`,
        factura
      )
      .pipe(
        map((response) => response.invoice),
        catchError((error) => {
          throw error;
        })
      );
  }

  /**
   * Crea un nuevo elemento de inventario
   * @param inventario Datos del inventario
   * @returns Observable con información del inventario creado
   */
  createInventario(inventario: any): Observable<Inventario> {
    return this.http
      .post<{ inventory: Inventario; msg: string }>(
        `${this.baseUrl}/consumableInventory`,
        inventario
      )
      .pipe(
        map((response) => response.inventory),
        catchError((error) => {
          throw error;
        })
      );
  }

  /**
   * Crea múltiples elementos de inventario en lote
   * @param items Lista de elementos a crear
   * @returns Observable con respuesta del servidor
   */
  createMultipleInventario(items: any[]): Observable<any> {
    return this.http
      .post<{
        msg: string;
        createdItems: any[];
        errors: any[];
        success: boolean;
      }>(`${this.baseUrl}/consumableInventory/batch`, { items })
      .pipe(
        map((response) => response),
        catchError((error) => {
          const errorResponse = {
            msg: 'Error al crear el inventario en lote',
            createdItems: [],
            errors: items.map((item) => ({
              error: 'Error de servidor',
            })),
            success: false,
          };
          return of(errorResponse);
        })
      );
  }
}
