import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { Direction } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { handleError } from '../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class DirectionsService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: Direction[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/direction/`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  get(id_direccion: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/direction/getById/${id_direccion}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  add(data: Direction): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlPromette}/direction/register`, data).pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Dirección creada exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  edit(id_direccion: number, data: Direction): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/direction/update`, { ...data, id_direccion })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Dirección actualizada exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  delete(ct_usuario_at: number, id_direccion: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/direction/delete`, { ct_usuario_at,id_direccion })
    .pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Dirección eliminada exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }
}
