import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { handleError } from '../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class CursesService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: any[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(area: string = 'PRODEP TLAXCALA'): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(`${this.apiUrlPromette}/certificates/${area}`)
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  getDesign(id_constanciaCurso: string): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(
        `${this.apiUrlPromette}/certificates/getDesign/${id_constanciaCurso}`
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

  registerCertificate(
    id_constanciaCurso: any,
    constancia_design: any
  ): Observable<boolean> {
    return this.http
      .post<{ msg: string; user: any }>(
        `${this.apiUrlPromette}/certificates/register`,
        { id_constanciaCurso, constancia_design }
      )
      .pipe(
        map((response: any) => {
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
}
