import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { environment } from '../../../../environments/environment';
import { handleError } from '../../../core/helpers/handle';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { DocumentosService } from './documentos.service';
import { FileHandlerService } from '../../../core/services/file-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PreofileService {
  private apiUrlRupeet = environment.apiUrlRupeet; // Base URL for RUPEET API
  private apiUrlPromette = environment.apiUrlPromette; // Base URL for Promette API

  constructor(
    private http: HttpClient,
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private documentosService: DocumentosService,
    private fileHandler: FileHandlerService
  ) {}

  // Updated method to return user details, adjust the response format if needed
  getInfo(curp: string): Observable<any> {
    // Changed to Observable<any> if response is more complex
    return this.http
      .post<{ usuario: any }>(`${this.apiUrlRupeet}/users/details`, { curp })
      .pipe(
        map((response) => response.usuario), // Assuming you want to return the 'user' object
        catchError((error) =>
          handleError(error, this.alertService, 'Error de autenticación')
        )
      );
  }
  uploadImage(
    file: File,
    ct_documento_id: number,
    dt_informacion_rupeet_id: number
  ): Observable<any> {
    // Muestra el loading
    this.loading.show();

    // Crea un objeto FormData
    const formData = new FormData();
    formData.append(
      'id_informacion_rupeet',
      dt_informacion_rupeet_id.toString()
    );
    formData.append('id_documento', ct_documento_id.toString());
    formData.append('nombreDocumento', 'Foto de perfil');
    formData.append('tipoDocumento', 'image');
    formData.append('file', file, file.name);

    return this.http
      .post<any>(`${this.apiUrlRupeet}/uploadFiles/upload`, formData)
      .pipe(
        map((response) => {
          this.loading.hide(); // Oculta el loading
          this.alertService.success(`Se ha guardado la información`);
          return response; // Retorna la respuesta
        }),
        catchError((error) => {
          this.loading.hide(); // Oculta el loading en caso de error
          handleError(error, this.alertService, 'Error al subir la imagen');
          return throwError(error);
        })
      );
  }

  fetchFile(dt_informacion_rupeet_id: number): Observable<any> {
    // Muestra el loading
    this.loading.show();

    console.log(`Solicitando imagen para ID: ${dt_informacion_rupeet_id}`);

    // First, fetch the document info
    return this.documentosService
      .documentInfo(dt_informacion_rupeet_id, 15)
      .pipe(
        switchMap((data) => {
          if (!data || !data.ruta) {
            this.loading.hide();
            console.log('No se encontró ruta para el documento');
            return of(null);
          }

          console.log('Ruta del archivo obtenida:', data.ruta);

          // Extraer correctamente el id_informacion_rupeet y nombreArchivo
          const { id_informacion_rupeet, nombreArchivo } =
            this.fileHandler.parseFilePath(data.ruta);

          // Construir la URL correctamente
          const url = this.fileHandler.buildFileUrl(
            id_informacion_rupeet || dt_informacion_rupeet_id.toString(),
            nombreArchivo
          );
          console.log('URL de solicitud:', url);

          // Fetch the file as a Blob
          return this.http.get(url, { responseType: 'blob' }).pipe(
            map((blob) => {
              this.loading.hide();
              // Crear una URL para el blob que el componente puede usar
              const objectUrl = URL.createObjectURL(blob);
              return objectUrl;
            }),
            catchError((error) => {
              this.loading.hide();
              console.error('Error al obtener la imagen:', error);
              return throwError(error);
            })
          );
        }),
        catchError((error) => {
          this.loading.hide();
          console.error('Error al obtener información del documento:', error);
          return throwError(error);
        })
      );
  }

  getPostalCode(codigoPostal: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlRupeet}/users/codigoPostal/${codigoPostal}`
    );
  }

  getInfoPostalCode(codigoPostal: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlRupeet}/users/infoCodigoPostal/${codigoPostal}`
    );
  }

  getPuestos(nombre_puesto: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlPromette}/position/getPositionByDescription/${nombre_puesto}`
    );
  }

  getEstadoCivil(estado_civil: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlRupeet}/users/civilStatus/${estado_civil}`
    );
  }

  getPuestosId(id_puesto: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlPromette}/position/getById/${id_puesto}`
    );
  }

  // Función para guardar la información
  saveInfo(data: any): Observable<any> {
    // Muestra el loading
    this.loading.show();

    return this.http
      .post<any>(`${this.apiUrlRupeet}/users/updateRupeet`, data)
      .pipe(
        map((response) => {
          this.loading.hide(); // Oculta el loading
          if (response) {
            this.alertService.success(`Se ha guardado la información`);
            return true;
          }
          return false;
        }),
        catchError((error) => {
          this.loading.hide(); // Oculta el loading en caso de error
          handleError(
            error,
            this.alertService,
            'Error al guardar la información'
          );
          return throwError(error);
        })
      );
  }

  // Método para actualizar la contraseña
  updatePassword(newPassword: string): Observable<any> {
    this.loading.show();

    return this.http
      .post<any>(`${this.apiUrlPromette}/user/updatePassword`, {
        newPassword,
      })
      .pipe(
        map((response) => {
          this.loading.hide();
          if (response) {
            this.alertService.success(
              'La contraseña se ha actualizado correctamente'
            );
            return true;
          }
          return false;
        }),
        catchError((error) => {
          this.loading.hide();
          handleError(
            error,
            this.alertService,
            'Error al actualizar la contraseña'
          );
          return throwError(error);
        })
      );
  }
}
