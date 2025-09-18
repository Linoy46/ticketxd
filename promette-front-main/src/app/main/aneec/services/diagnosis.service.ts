import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DiagnosisResponse } from '../interfaces/Documentos/Diagnostico.interface';


@Injectable({
  providedIn: 'root',
})
export class DiagnosisService {
  private apiUrl = 'https://dev.septlaxcala.gob.mx/app/promette/api/annecEvaluator/registrarDiagnostico';

  private apiUrlPromette = environment.apiUrlPromette;

  constructor(private httpClient: HttpClient, private http: HttpClient) {}

  /*public registrarDiagnostico(data: any): Observable<any> {
    return this.httpClient.post(this.apiUrl, data);
  }

  //Obtener los datos de los pacientes
  getDiagnosticos(): Observable<DiagnosisResponse> {
    return this.http.get<DiagnosisResponse>(`${this.apiUrlPromette}/annecEvaluator/diagnosticos`).pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        return of({
          success: false,
          message: 'Error al obtener los datos',
          diagnosticos: [],
          error: error
        });
      })
    );
  }*/

}
