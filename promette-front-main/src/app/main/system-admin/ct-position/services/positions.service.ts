import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { Position } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { handleError } from '../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class PositionsService {
  private apiUrlPromette = environment.apiUrlPromette;
  private apiUrlInfraestructura = environment.apiUrlInfraestructura;
  private data: Position[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/position/`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  get(id_puesto: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(`${this.apiUrlPromette}/position/getById/${id_puesto}`)
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  getArea(id_area: number): Observable<any>{
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(`${this.apiUrlInfraestructura}/area/${id_area}`)
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  add(data: Position): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlPromette}/position/register`, data).pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Puesto creado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  edit(id_puesto: number, data: Position): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/position/update`, { ...data, id_puesto })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Puesto actualizado exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  getDataAreas(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlInfraestructura}/area/conRelaciones`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  registerPermissionsPosition(permissions: any): Observable<boolean> {
    return this.http
      .post<{ msg: string; Position: any }>(
        `${this.apiUrlPromette}/permissions/permissionsPosition`,
        { permissions }
      )
      .pipe(
        map((response) => {
          if (response) {
            this.alertService.success(
              'Registro exitoso',
              `Se han agregado los permisos`
            );
            return true;
          }
          return false;
        }),
        catchError((error) =>
          handleError(error, this.alertService, 'Error al registrar')
        )
      );
  }

  getModulesPermissions(areas: string = '1|2|3'): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/permissions/${areas}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  getPermissionsPositions(ct_puesto_id: string): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(
        `${this.apiUrlPromette}/permissions/getPermissionsPosition/${ct_puesto_id}`
      )
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  delete(ct_usuario_at: number, id_puesto: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/position/delete`, { ct_usuario_at,id_puesto })
    .pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Puesto eliminado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  removePermissionsPosition(permissions: string[]): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .post<any>(`${this.apiUrlPromette}/permissions/removePermissionsPosition`, {
        permissions, // Lista de permisos a eliminar
      })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success(
            'Permisos eliminados exitosamente',
            `Los permisos seleccionados han sido eliminados para el puesto.`
          );
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, 'Error al eliminar permisos');
        })
      );
  }

}
