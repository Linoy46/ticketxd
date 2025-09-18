import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Area,
  AnalystsResponse,
  AnalystResponse,
  NewAnalystRequest,
  DeleteAnalystRequest,
  AdministrativeUnit,
  AdministrativeUnitsResponse,
  UserByPosition,
} from '../interfaces/administrative.interface';
import { environment } from '../../../../../environments/environment';
import { map } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdministrativeService {
  eliminarRestriccion(id_producto_area: any) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiUrlPromette;

  constructor(private http: HttpClient) {}

  // Obtener todas las áreas
  getAreas(): Observable<{ areas: Area[] }> {
    return this.http.get<{ areas: Area[] }>(`${this.apiUrl}/area`);
  }

  // Obtener todas las unidades administrativas
  getAdministrativeUnits(): Observable<AdministrativeUnitsResponse> {
    return this.http.get<AdministrativeUnitsResponse>(
      `${this.apiUrl}/administrativeUnits`
    );
  }

  // Obtener una unidad administrativa por ID
  getAdministrativeUnitById(
    id: number
  ): Observable<{ administrativeUnit: AdministrativeUnit }> {
    return this.http.get<{ administrativeUnit: AdministrativeUnit }>(
      `${this.apiUrl}/administrativeUnits/${id}`
    );
  }

  // Registrar una nueva unidad administrativa
  registerAdministrativeUnit(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/administrativeUnits/register`,
      data
    );
  }

  // Actualizar una unidad administrativa
  updateAdministrativeUnit(data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/administrativeUnits/update`,
      data
    );
  }

  // Eliminar una unidad administrativa
  deleteAdministrativeUnit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/administrativeUnits/${id}`);
  }

  // Métodos de analistas
  getAnalysts(): Observable<AnalystsResponse> {
    return this.http.get<AnalystsResponse>(`${this.apiUrl}/analist`);
  }

  // Obtener analistas por área
  getAnalystsByArea(areaId: number): Observable<AnalystsResponse> {
    return this.http.get<AnalystsResponse>(
      `${this.apiUrl}/analist/area/${areaId}`
    );
  }

  // Obtener analistas por unidad administrativa
  getAnalystsByAdministrativeUnit(
    unitId: number
  ): Observable<AnalystsResponse> {
    return this.http.get<AnalystsResponse>(
      `${this.apiUrl}/analist/administrativeUnit/${unitId}`
    );
  }

  getAnalystById(id: number): Observable<AnalystResponse> {
    return this.http.get<AnalystResponse>(`${this.apiUrl}/detail/${id}`);
  }

  registerAnalyst(data: NewAnalystRequest): Observable<AnalystResponse> {
    console.log('Datos al rl_unidad: ', data);
    return this.http.post<AnalystResponse>(
      `${this.apiUrl}/analist/register`,
      data
    );
  }

  // Actualizar analista
  updateAnalyst(data: any): Observable<AnalystResponse> {
    return this.http.put<AnalystResponse>(
      `${this.apiUrl}/analist/update`,
      data
    );
  }

  // Eliminar analista
  deleteAnalyst(data: DeleteAnalystRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/analist/delete`, data);
  }

  // Obtener usuarios específicos para asignar como analistas
  // Reemplaza el método anterior getUsers() con este que usa el endpoint específico
  getUsersBySpecificPositions(): Observable<{ users: UserByPosition[] }> {
    return this.http.get<{ users: UserByPosition[] }>(
      `${this.apiUrl}/userPosition/bySpecificPositions`
    );
  }

  //Registro en rl_area_partida
  registroAreaPartida(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partidaArea`, data);
  }

  //obtener partidas segun la unidad administrativa
  partidasPorArea(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidaArea/porArea/${id}`);
  }

  eliminarPartidaArea(id_partida_area: number, ct_usuario_at: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/partidaArea/${id_partida_area}`, {
      body: { ct_usuario_at }
    });
  }

  getPartidas(id_area_fin: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidaArea/disponibles/${id_area_fin}`);
  }

  getProductos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/consumableProduct`);
  }

  descartarProducto(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productoArea`, data);
  }

  //obten la lista de los productos restringidos segun el area
  productosRestringidos(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/productoArea/porArea/${id}`);
  }
  getProductosPorArea(idAreaFin: number) {
    return this.http.get<any>(`${this.apiUrl}/productoArea/productosPorArea/${idAreaFin}`
    );
  }

  // Obtener áreas por analista
  getAreasByAnalyst(userId: number): Observable<{ areas: Area[] }> {
    return this.http.get<{ areas: Area[] }>(
      `${this.apiUrl}/analist/areas/${userId}`
    );
  }

  descargarExcel(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/excel/desglose-partida`, data, {
      responseType: 'blob'
    });
  }

  // Obtener áreas administrativas por puesto financiero (cruzando con API externa de infraestructura)
  getAdministrativeUnitsByPuesto(puestoId: number) {
    // 1. Obtener rl_area_financiero locales (unidades administrativas)
    // 2. Obtener áreas de infraestructura externas
    // 3. Cruzar por id_area_infra === id_area y filtrar por puesto
    const infraestructuraApiUrl = environment.apiUrlInfraestructura; // Usa la variable global
    return this.getAdministrativeUnits().pipe(
      map((response: any) => response.administrativeUnits || []),
      switchMap((localUnits: any[]) =>
        this.http.get<any[]>(`${infraestructuraApiUrl}/api/area/conRelaciones/`).pipe(
          map((infraAreas: any[]) => {
            const areas = localUnits
              .filter((unit: any) => unit.ct_puesto_id === puestoId)
              .map((unit: any) => {
                const areaInfra = infraAreas.find((a: any) => a.id_area === unit.id_area_infra);
                return areaInfra ? { nombre_area: areaInfra.nombre } : null;
              })
              .filter((a: any) => !!a);
            return { areas };
          })
        )
      )
    );
  }

  // Obtener todas las áreas financieras (rl_area_financiero)
  getAreasFinancieras(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/area/financieras`);
  }

}
