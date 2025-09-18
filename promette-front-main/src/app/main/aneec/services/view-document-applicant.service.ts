import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ViewDocumentApplicantService {
  private apiUrlPromette = environment.apiUrlPromette;
  constructor( private loading: CoreLoadingService, private http: HttpClient,
     private CoreAlertService: CoreAlertService
   ) {    
  }

  getDocument(pdfFileName: string): Observable<Blob> {
    console.log(`LA RUTA ES LA SIGUIENTE ${pdfFileName}`)
    return this.http.get(`${this.apiUrlPromette}/annecApplicant/getSpecificDocuments/${pdfFileName}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.info('Documento no disponible.');
        return of(new Blob());
      })
    );
  }


  // Método para obtener un PDF específico
  getSpecificInforme(pdfFileName: string): Observable<Blob> {

    return this.http.get(`${this.apiUrlPromette}/annecApplicant/getSpecificInforme/${pdfFileName}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.info('Informe no disponible.');
        return of(new Blob());
      })
    );
  }//end method 

  // Método para obtener el PDF del acuse
  getReceiptPdf(curp: string): Observable<Blob> {
    return this.http.get(`${this.apiUrlPromette}/annecApplicant/reprintReceipt/${curp}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.info('Acuse no disponible.');
        return of(new Blob());
      })
    );
  }//end method

  // Método para obtener una planeación específica
  getSpecificPlanning(pdfFileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrlPromette}/annecApplicant/getSpecificPlanning/${pdfFileName}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.info('Planeación no disponible.');
        return of(new Blob());
      })
    );
  }
}
