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
export class DocumentosService {
  private apiUrlRupeet = environment.apiUrlRupeet;
  private data: any[] = [];

  constructor(
    private alertService: CoreAlertService,
    private loading: CoreLoadingService,
    private http: HttpClient
  ) {}

  documentInfo(
    id_informacion_rupeet: number,
    ct_documento_id: number
  ): Observable<any> {
    console.log(`Obteniendo información del documento: ID=${id_informacion_rupeet}, Doc=${ct_documento_id}`);
    return this.http
      .get<any>(
        `${this.apiUrlRupeet}/uploadFiles/getById/${id_informacion_rupeet}/${ct_documento_id}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error al obtener información del documento:', error);
          return of(null); // Devolver null en caso de error
        })
      );
  }
}
