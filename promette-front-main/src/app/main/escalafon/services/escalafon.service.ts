import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { Dictamen } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { handleError } from '../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class EscalafonService {
  private apiUrlRupeet = environment.apiUrlRupeet;
  private apiUrlPromette = environment.apiUrlPromette;
  private data: Dictamen[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(ids: any): Observable<any[]> {
    this.loading.show();

    // return this.http.get<any>(`${this.apiUrlRupeet}/escalafon/`).pipe(
    //   map((response) => {
    //     const dictamenes = response.dictamenes.map((d: any) => {
    //       const info = d.dt_informacion_rupeet;
    //       const nombreCompleto = `${info.nombre} ${info.apellido_paterno} ${info.apellido_materno}`.toUpperCase();

    //       let estatus = 'Desconocido';
    //       if (d.estado === 0 || d.estado === false) estatus = 'Rechazado';
    //       else if (d.estado === 1 || d.estado === true) estatus = 'En proceso';
    //       else if (d.estado === 2) estatus = 'Aceptado';

    //       return {
    //         ...d,
    //         nombre_completo: nombreCompleto,
    //         estatus,
    //       };
    //     });

    //     return dictamenes;
    //   }),
    //   tap(() => this.loading.hide()),
    //   catchError((error) => {
    //     console.log(error);
    //     this.alertService.error('Error al obtener los datos');
    //     this.loading.hide();
    //     return throwError(() => error);
    //   })
    // );

    return this.http.post<any>(`${this.apiUrlRupeet}/escalafon/`, { ids }).pipe(
      map((response) => {
        const dictamenes = response.dictamenes.map((d: any) => {
          const info = d.dt_informacion_rupeet;
          const nombreCompleto = `${info.nombre} ${info.apellido_paterno} ${info.apellido_materno}`.toUpperCase();

          let estatus = 'Desconocido';
          if (d.estado === 0 || d.estado === false) estatus = 'Rechazado';
          else if (d.estado === 1 || d.estado === true) estatus = 'En proceso';
          else if (d.estado === 2) estatus = 'Aceptado';

          return {
            ...d,
            nombre_completo: nombreCompleto,
            estatus,
          };
        });

        return dictamenes;
      }),
      tap(() => this.loading.hide()),
      catchError((error) => {
        console.log(error);
        //this.alertService.error('Sin registros. Verifique con el Adminstrador si cuenta con permisos suficientes.');
        this.loading.hide();
        return throwError(() => error);
      })
    );

  }

  getDictamenes(ids: any): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.post<any>(`${this.apiUrlRupeet}/users/dictamenes/escalafon/`, { ids }).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error) => {
        console.log(error);
        //this.alertService.error('Sin registros. Verifique con el Adminstrador si cuenta con permisos suficientes.');
        this.loading.hide(); // Oculta el indicador de carga en caso de error
        return throwError(() => error);
      })
    );
  }

  get(id_dictamen_escalafon: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlRupeet}/escalafon/ver/${id_dictamen_escalafon}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  add(data: Dictamen): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlRupeet}/escalafon/registrar`, data).pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Dictame creado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }


  edit(id_dictamen_escalafon: number, data: Dictamen): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlRupeet}/escalafon/actualizar`, { ...data, id_dictamen_escalafon })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Dictamen actualizado exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }


  generarPdf(folio_dictamen:number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlRupeet}/escalafon/obtener-cedula/${folio_dictamen}`,
      { responseType: 'blob' }
    ).pipe(
      catchError(error => {
        this.alertService.error('Error al obtener el documento');
        return of(new Blob());
      })
    );
  }

  consultarInicioFolioEscalafon(): Observable<any> {
    return this.http.get(`${this.apiUrlRupeet}/escalafon/folio`);
  }

  generaClaveFuncionExcel(): Observable<any> {
    return this.http.get(`${this.apiUrlRupeet}/escalafon/formato/clave/funcion`);
  }

  generaCatalogoExcel(periodo_escalafon: string): Observable<any> {
    return this.http.get(`${this.apiUrlRupeet}/escalafon/catalogo/${periodo_escalafon}`);
  }

  habilitarAdmin(folio_dictamen:number): Observable<any> {
    return this.http.post(`${this.apiUrlRupeet}/escalafon/cambio-dictamen-admin`,{folio_dictamen});
  }
}
