import { Injectable } from '@angular/core';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReporstService {
  private apiUrlPromette = environment.apiUrlPromette;

  constructor(private http: HttpClient, private CoreAlertService: CoreAlertService) { }

  // Método para descargar el archivo Excel de costeo
  generalCosting(idAreaFin: number[], idFinanciamiento: number, idUsuario: number): Observable<Blob | null> {
    return this.http.post(`${this.apiUrlPromette}/excel/costeo-producto`, {
      id_area_fin: idAreaFin,
      id_financiamiento: idFinanciamiento,
      id_usuario: idUsuario
    }, {
      responseType: 'blob',
    }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo Excel de costeo');
        return of(null);
      })
    );
  }

  // Método para descargar el archivo Excel de techos presupuestales/desglose de concepto por partida
  techosPresupuestales(idAreaFin: number[]): Observable<Blob | null> {
    const body = {
      id_areas: idAreaFin
    };
    return this.http.post(`${this.apiUrlPromette}/excel/desgloseConcepto`, body, { responseType: 'blob' }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo Excel de techos presupuestales');
        return of(null);
      })
    );
  }

  // Método para descargar el archivo Excel de anteproyectos
  anteproyectos(ct_area_id: number[], ct_puesto_id: number, ct_financiamiento_id: number): Observable<Blob | null> {
    return this.http.post(`${this.apiUrlPromette}/excel/desglose-partida`, { ct_area_id, ct_puesto_id, ct_financiamiento_id }, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo Excel de justificación de partida');
        return of(null);
      })
    );
  }

  requisicionMensual(ct_area_id: number[], id_usuario: number): Observable<Blob | null> {
    return this.http.post(`${this.apiUrlPromette}/pdf/requisicion-compra`, { ct_area_id, id_usuario }, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo PDF de requisición mensual');
        return of(null);
      })
    );
  }

  // Método para obtener area financiera
  getLastBudgetAreaByInfra(ct_area_id: number): Observable<{ id_area_fin: number, id_area_infra: number } | null> {
    return this.http.get<{ msg: string, results: { id_area_fin: number, id_area_infra: number }[] }>(`${this.apiUrlPromette}/budget/area-financiero/by-infra/${ct_area_id}`).pipe(
      catchError(error => {
        //this.CoreAlertService.error('Error al obtener el área financiera por infraestructura');
        return of(null);
      }),
      map(response => {
        if (response && response.results.length > 0) {
          return response.results[response.results.length - 1];
        }
        return null;
      })
    );
  }

  // Método para descargar el consolidado de costeo por producto
  costeoProductoConsolidado(idAreaFin: number[], idFinanciamiento: number, idUsuario: number): Observable<Blob | null> {
    return this.http.post(`${this.apiUrlPromette}/excel/costeo-producto`, {
      id_area_fin: idAreaFin,
      id_financiamiento: idFinanciamiento,
      id_usuario: idUsuario
    }, {
      responseType: 'blob',
    }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo Excel de costeo por producto consolidado');
        return of(null);
      })
    );
  }

  // Método para descargar el consolidado de desglose por partida
  desglosePartidaConsolidado(ct_area_id: number[], ct_puesto_id: number, ct_financiamiento_id: number): Observable<Blob | null> {
    return this.http.post(`${this.apiUrlPromette}/excel/desglose-partida`, {
      ct_area_id,
      ct_puesto_id,
      ct_financiamiento_id
    }, {
      responseType: 'blob',
    }).pipe(
      catchError(error => {
        this.CoreAlertService.error('Error al obtener el archivo Excel de desglose por partida consolidado');
        return of(null);
      })
    );
  }

}
