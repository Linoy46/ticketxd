import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { User } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { handleError } from '../../../../core/helpers/handle';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrlPromette = environment.apiUrlPromette;
  private data: User[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  getData(id_usuario: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/user/${id_usuario}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error) => {
        console.log(error);
        this.alertService.error('Error al obtener los datos');
        this.loading.hide(); // Oculta el indicador de carga en caso de error
        return throwError(() => error);
      })
    );
  }

  get(id_usuario: number): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http.get<any>(`${this.apiUrlPromette}/user/getById/${id_usuario}`).pipe(
      // Solicitud HTTP GET
      tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
  }

  // Get original
  //get(id_usuario: number): Observable<any> {
  //  this.loading.show(); // Muestra el indicador de carga
  //  const registro = this.data.find((item) => item.id_usuario === id_usuario);
  //  if (!registro) {
  //    this.alertService.error('Usuario no encontrado');
  //    this.loading.hide(); // Oculta el indicador de carga si no se encuentra el registro
  //    return throwError(() => new Error('Usuario no encontrado'));
  //  }
  //  this.loading.hide(); // Oculta el indicador de carga después de encontrar el registro
  //  return of(registro);
  //}
  // Add original
  //add(data: User): Observable<User[]> {
  //  this.loading.show(); // Muestra el indicador de carga
  //  data.id_usuario = this.data.length + 1;
  //  this.data.push(data);
  //  this.alertService.success('Usuario agregado correctamente');
  //  this.loading.hide(); // Oculta el indicador de carga después de la operación exitosa
  //  return of(this.data);
  //}

  // Add no utulizado debido a que se recupera el Register del Auth
  //add(data: User): Observable<any> {
  //  this.loading.show(); // Muestra el indicador de carga
  //
  //  return this.http.post(`${this.apiUrlPromette}/user/register`, data).pipe(
  //    tap(() => {
  //      this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
  //      this.alertService.success('Usuario creado exitosamente'); // Muestra un mensaje de éxito
  //    }),
  //    catchError((error: any) => {
  //      this.loading.hide();
  //      return handleError(error, this.alertService, '');
  //    })
  //  );
  //}
  // Edit original
  //edit(id_usuario: number, datosActualizados: User): Observable<User[]> {
  //  this.loading.show(); // Muestra el indicador de carga
  //  const index = this.data.findIndex((item) => item.id_usuario === id_usuario);
  //  if (index === -1) {
  //    this.alertService.error('Usuario no encontrado');
  //    this.loading.hide(); // Oculta el indicador de carga si no se encuentra el Usuario
  //    return throwError(() => new Error('Usuario no encontrado'));
  //  }
  //  this.data[index] = { ...this.data[index], ...datosActualizados };
  //  this.alertService.success('Usuario actualizado correctamente');
  //  this.loading.hide(); // Oculta el indicador de carga después de la operación exitosa
  //  return of(this.data);
  //}

  edit(id_usuario: number, data: User): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga

    return this.http
      .put(`${this.apiUrlPromette}/user/update`, { ...data, id_usuario })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success('Usuario actualizado exitosamente'); // Muestra un mensaje de éxito
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  delete(ct_usuario_at: number, id_usuario: number): Observable<any> {
    return this.http
    .put(`${this.apiUrlPromette}/user/delete`, { ct_usuario_at,id_usuario })
    .pipe(
      tap(() => {
        this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
        this.alertService.success('Usuario eliminado exitosamente'); // Muestra un mensaje de éxito
      }),
      catchError((error: any) => {
        this.loading.hide();
        return handleError(error, this.alertService, '');
      })
    );
    //this.loading.show(); // Muestra el indicador de carga
    // const index = this.data.findIndex((item) => item.id_usuario === id_usuario);
    // if (index === -1) {
    //   this.alertService.error('Usuario no encontrado');
    //   this.loading.hide(); // Oculta el indicador de carga si no se encuentra el Usuario
    //   return throwError(() => new Error('Usuario no encontrado'));
    // }
    // this.data = this.data.filter((item) => item.id_usuario !== id_usuario);
    // this.alertService.success('Usuario eliminado correctamente');
    // this.loading.hide(); // Oculta el indicador de carga después de la operación exitosa
    // return of(this.data);
  }

  registerPermissionsUser(permissions: any): Observable<boolean> {
    return this.http
      .post<{ msg: string; user: any }>(
        `${this.apiUrlPromette}/permissions/permissionsUser`,
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

  getModulesPermissions(areas: string = '1|14'): Observable<any> {
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

  getPermissionsUsers(id_usuario: string): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(`${this.apiUrlPromette}/permissions/getPermissionsUser/${id_usuario}`)
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  getPermissionsUsersByUser(id_usuario: string): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .get<any>(`${this.apiUrlPromette}/permissions/getPermissionsByUser/${id_usuario}`)
      .pipe(
        // Solicitud HTTP GET
        tap(() => this.loading.hide()), // Oculta el indicador de carga después de la operación exitosa
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, '');
        })
      );
  }

  removePermissionsUser(permissions: string[]): Observable<any> {
    this.loading.show(); // Muestra el indicador de carga
    return this.http
      .post<any>(`${this.apiUrlPromette}/permissions/removePermissionsUser`, {
        permissions, // Lista de permisos a eliminar
      })
      .pipe(
        tap(() => {
          this.loading.hide(); // Oculta el indicador de carga después de una respuesta exitosa
          this.alertService.success(
            'Permisos eliminados exitosamente',
            `Los permisos seleccionados han sido eliminados para el usuario.`
          );
        }),
        catchError((error: any) => {
          this.loading.hide();
          return handleError(error, this.alertService, 'Error al eliminar permisos');
        })
      );
  }
}
