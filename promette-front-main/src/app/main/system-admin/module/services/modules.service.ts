import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { Module } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { handleError } from '../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class ModulesService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: Module[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/module/`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  get(id_modulo: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/module/getById/${id_modulo}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  add(data: Module): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlPromette}/module/register`, data).pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Módulo creado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  edit(id_modulo: number, data: Module): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/module/update`, { ...data, id_modulo })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Módulo actualizado exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  getDataModules(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/module/primary`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  delete(ct_usuario_at: number, id_modulo: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/module/delete`, { ct_usuario_at,id_modulo })
    .pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Módulo eliminado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }
}
