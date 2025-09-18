import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../../../core/services/core.loading.service';
import { Function } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { handleError } from '../../../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: Function[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/function/`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  getFunctions(id_modulo: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/function/${id_modulo}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  get(id_funcion: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/function/getById/${id_funcion}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  add(data: Function): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlPromette}/function/register`, data).pipe(
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

  edit(id_funcion: number, data: Function): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/function/update`, { ...data, id_funcion })
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

  delete(ct_usuario_at: number, id_funcion: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/function/delete`, { ct_usuario_at,id_funcion })
    .pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Función eliminado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }
}
