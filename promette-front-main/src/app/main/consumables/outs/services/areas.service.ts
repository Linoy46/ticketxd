import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { catchError, tap, map } from 'rxjs/operators';
import { handleError } from '../../../../core/helpers/handle';
import { environment } from '../../../../../environments/environment';

export interface Area {
  id_area: number;
  nombre: string;
  id_departamento_ct_infraestructura_departamento: {
    id_departamento: number;
    nombre: string;
    id_direccion_ct_infraestructura_direccion: {
      id_direccion: number;
      nombre: string;
    };
  };
}

export interface AreasResponse {
  success?: boolean;
  message?: string;
  // Asumiendo que tu API devuelve un array directamente o en una propiedad específica
}

export interface Direccion {
  id_direccion: number;
  nombre: string;
}

export interface Departamento {
  id_departamento: number;
  nombre: string;
  id_direccion: number;
}

export interface CreateAreaRequest {
  nombre: string;
  id_departamento: number;
}

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  // URL específica para el servicio de áreas (diferente al endpoint base)
  private areasEndpoint = `${environment.apiUrlInfraestructura}/area/conRelaciones`;

  constructor(
    private http: HttpClient,
    private alertService: CoreAlertService,
    private loading: CoreLoadingService
  ) {}

  /**
   * Obtiene todas las áreas desde tu API
   * @returns Observable con la lista de áreas
   */
  getAllAreas(): Observable<Area[]> {
    this.loading.show();
    return this.http.get<Area[]>(`${this.areasEndpoint}`).pipe(
      map((response) => response || []),
      tap(() => this.loading.hide()),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al cargar las áreas'
        );
      })
    );
  }
  /**
   * Obtiene un área específica por ID
   * @param id ID del área a consultar
   * @returns Observable con los detalles del área
   */
  getAreaById(id: number): Observable<Area> {
    this.loading.show();
    return this.http.get<Area>(`${this.areasEndpoint}/${id}`).pipe(
      tap(() => this.loading.hide()),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(
          error,
          this.alertService,
          'Error al obtener el área'
        );
      })
    );
  }

  /**
   * Obtiene el texto completo de jerarquía para mostrar en el select
   * @param area Área con la información completa
   * @returns String con formato "Dirección -> Departamento -> Área"
   */
  getAreaDisplayText(area: Area): string {
    const direccion =
      area.id_departamento_ct_infraestructura_departamento
        .id_direccion_ct_infraestructura_direccion.nombre;
    const departamento =
      area.id_departamento_ct_infraestructura_departamento.nombre;
    const areaName = area.nombre;

    return `${direccion} → ${departamento} → ${areaName}`;
  }

  /**
   * Obtiene solo el nombre de la dirección de un área
   * @param area Área con la información completa
   * @returns String con el nombre de la dirección
   */
  getDireccionName(area: Area): string {
    return area.id_departamento_ct_infraestructura_departamento
      .id_direccion_ct_infraestructura_direccion.nombre;
  }

  /**
   * Obtiene solo el nombre del departamento de un área
   * @param area Área con la información completa
   * @returns String con el nombre del departamento
   */
  getDepartamentoName(area: Area): string {
    return area.id_departamento_ct_infraestructura_departamento.nombre;
  }

  /**
   * Obtiene todas las direcciones disponibles
   * @returns Observable con la lista de direcciones
   */
  getDirecciones(): Observable<Direccion[]> {
    return this.http
      .get<any>(`${environment.apiUrlInfraestructura}/direccion`)
      .pipe(
        map((response) => {
          // Tu API puede devolver un array directamente o dentro de una propiedad
          let direcciones = Array.isArray(response)
            ? response
            : response.direcciones || response.data || [];

          // Mapear la respuesta a nuestro formato esperado
          return direcciones.map((dir: any) => ({
            id_direccion: dir.id_direccion,
            nombre: dir.nombre,
          }));
        }),
        catchError((error: any) => {
          return handleError(
            error,
            this.alertService,
            'Error al cargar las direcciones'
          );
        })
      );
  }

  /**
   * Obtiene los departamentos de una dirección específica
   * @param direccionId ID de la dirección
   * @returns Observable con la lista de departamentos
   */
  getDepartamentosByDireccion(direccionId: number): Observable<Departamento[]> {
    return this.http
      .get<any>(
        `${environment.apiUrlInfraestructura}/departamento/direccion/${direccionId}`
      )
      .pipe(
        map((response) => {
          // Tu API puede devolver un array directamente o dentro de una propiedad
          let departamentos = Array.isArray(response)
            ? response
            : response.departamentos || response.data || [];

          // Mapear la respuesta a nuestro formato esperado
          return departamentos.map((dept: any) => ({
            id_departamento: dept.id_departamento,
            nombre: dept.nombre,
            id_direccion: dept.id_direccion,
          }));
        }),
        catchError((error: any) => {
          return handleError(
            error,
            this.alertService,
            'Error al cargar los departamentos'
          );
        })
      );
  }

  /**
   * Crea una nueva área
   * @param areaData Datos de la nueva área
   * @returns Observable con la respuesta del servidor
   */
  createArea(areaData: CreateAreaRequest): Observable<Area> {
    return this.http
      .post<Area>(`${environment.apiUrlInfraestructura}/area`, areaData)
      .pipe(
        tap(() => {
          this.alertService.success('Área creada correctamente');
        }),
        catchError((error: any) => {
          return handleError(
            error,
            this.alertService,
            'Error al crear el área'
          );
        })
      );
  }
}
