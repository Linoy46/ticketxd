import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';

// Interfaces para definir las respuestas de la API
export interface DocumentCheckResponse {
  success: boolean;
  hasDocument: boolean;
  folio_formato: string;
  documentInfo?: {
    path: string;
    name: string;
  };
  message?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data?: {
    path: string;
    replaced: boolean;
    originalName: string;
    folio_formato: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OutsHistorialService {
  private apiBase = environment.apiUrlPromette;
  private entregasEndpoint = `${this.apiBase}/consumableDelivery`;
  private formatosEndpoint = `${this.apiBase}/entregaFormato/historial`;

  constructor(
    private http: HttpClient,
    private alertService: CoreAlertService,
    private loadingService: CoreLoadingService
  ) {}

  /**
   * Obtiene todos los formatos de entrega
   */
  getFormatos(): Observable<any> {
    return this.http.get<any>(this.formatosEndpoint).pipe(
      catchError((error) => {
        this.alertService.error('Error al cargar los formatos');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los formatos de entrega con filtros opcionales
   */
  getFormatosEntrega(filtros?: any): Observable<any> {
    return this.http
      .get<any>(this.formatosEndpoint, { params: filtros || {} })
      .pipe(
        catchError((error) => {
          this.alertService.error('Error al cargar los formatos de entrega');
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene un formato de entrega por su ID
   */
  getFormatoById(idFormato: number): Observable<any> {
    return this.http.get<any>(`${this.formatosEndpoint}/${idFormato}`).pipe(
      catchError((error) => {
        this.alertService.error('Error al cargar el formato');
        return throwError(() => error);
      })
    );
  }

  /**
   * Genera el PDF para un formato de entrega específico
   * @param folioFormato Folio del formato de entrega
   * @returns Observable con el PDF como Blob
   */
  generateEntregaPDF(folioFormato: string): Observable<Blob> {
    // URL para descargar el PDF
    const pdfUrl = `${this.apiBase}/pdf/entrega-materiales/${folioFormato}`;

    // Obtener el token de autenticación
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    // Configurar encabezados con autenticación
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    // Petición HTTP para obtener el PDF como Blob
    return this.http
      .get(pdfUrl, {
        responseType: 'blob',
        headers,
      })
      .pipe(
        catchError((error) => {
          this.alertService.error('Error al generar el PDF');
          return throwError(() => new Error('Error al generar el PDF'));
        })
      );
  }

  /**
   * Verifica si un formato tiene un documento asociado
   * @param folioFormato Folio del formato de entrega
   * @returns Observable con la información del documento
   */
  checkFormatoDocument(
    folioFormato: string
  ): Observable<DocumentCheckResponse> {
    return this.http
      .get<DocumentCheckResponse>(
        `${this.entregasEndpoint}/formato/${folioFormato}/check-documento`
      )
      .pipe(
        catchError((error) => {
          this.alertService.error(
            'Error al verificar el documento del formato'
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Sube un documento para un formato de entrega
   * @param folioFormato Folio del formato de entrega
   * @param file Archivo a subir
   * @returns Observable con la respuesta del servidor
   */
  uploadFormatoDocument(
    folioFormato: string,
    file: File
  ): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<DocumentUploadResponse>(
        `${this.entregasEndpoint}/formato/${folioFormato}/documento`,
        formData
      )
      .pipe(
        catchError((error) => {
          this.alertService.error('Error al subir el documento');
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene un documento de un formato de entrega
   * @param folioFormato Folio del formato de entrega
   * @returns Observable con el documento como Blob
   */
  getFormatoDocument(folioFormato: string): Observable<Blob> {
    return this.http
      .get(`${this.entregasEndpoint}/formato/${folioFormato}/documento`, {
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          this.alertService.error('Error al obtener el documento del formato');
          return throwError(() => error);
        })
      );
  }
}
