import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../../../core/services/core.loading.service';
import { ModuleArea } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { handleError } from '../../../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class ModuleAreasService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: ModuleArea[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getTreeNodesData() {
    return [
        {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-inbox',
            children: [
                {
                    key: '0-0',
                    label: 'Work',
                    data: 'Work Folder',
                    icon: 'pi pi-fw pi-cog',
                },
                {
                    key: '0-1',
                    label: 'Home',
                    data: 'Home Folder',
                    icon: 'pi pi-fw pi-home'
                }
            ]
        },
        {
            key: '1',
            label: 'Events',
            data: 'Events Folder',
            icon: 'pi pi-fw pi-calendar',
            children: [
                { key: '1-0', label: 'Meeting', icon: 'pi pi-fw pi-calendar-plus', data: 'Meeting' },
                { key: '1-1', label: 'Product Launch', icon: 'pi pi-fw pi-calendar-plus', data: 'Product Launch' },
                { key: '1-2', label: 'Report Review', icon: 'pi pi-fw pi-calendar-plus', data: 'Report Review' }
            ]
        },
        {
            key: '2',
            label: 'Movies',
            data: 'Movies Folder',
            icon: 'pi pi-fw pi-star-fill',
            children: [
                {
                    key: '2-0',
                    icon: 'pi pi-fw pi-star-fill',
                    label: 'Al Pacino',
                    data: 'Pacino Movies'
                },
                {
                    key: '2-1',
                    label: 'Robert De Niro',
                    icon: 'pi pi-fw pi-star-fill',
                    data: 'De Niro Movies'
                }
            ]
        }
    ];
}

  getFiles(){
    return Promise.resolve(this.getTreeNodesData());
  }

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

  getModules(id_area: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/moduleArea/${id_area}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  get(id_modulo_area: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/moduleArea/getById/${id_modulo_area}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  add(data: ModuleArea): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http.post(`${this.apiUrlPromette}/moduleArea/register`, data).pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Área creada exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  edit(id_modulo_area: number, data: ModuleArea): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/moduleArea/update`, { ...data, id_modulo_area })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Área actualizada exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  delete(ct_usuario_at: number, id_modulo_area: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/moduleArea/delete`, { ct_usuario_at,id_modulo_area })
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
