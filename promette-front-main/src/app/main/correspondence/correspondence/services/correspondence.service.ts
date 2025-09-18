// En promette-front/src/app/main/correspondence/correspondence/services/correspondence.service.ts

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CorrespondenceService {
  private apiUrl = `${environment.apiUrlPromette}`;

  constructor(private http: HttpClient) {}

  // Método especial para guardar correspondencia usando la ruta real del backend
  createCorrespondence(formData: FormData) {
    return this.http.post(
      `${this.apiUrl}/CorrespondenciaRoutes/registroCorrespondencia`,
      formData
    );
  }

  getClasificacionPrioridad() {
    return this.http.get(
      `${this.apiUrl}/CorrespondenciaRoutes/clasificacionPrioridad`
    );
  }

  getFormaEntrega() {
    return this.http.get(`${this.apiUrl}/CorrespondenciaRoutes/formaEntrega`);
  }

  // getCorrespondences(params?: any) {
  //   // Si hay parámetros, los agrega como query params
  //   if (params) {
  //     const query = Object.keys(params)
  //       .filter((key) => params[key] !== '')
  //       .map(
  //         (key) =>
  //           `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  //       )
  //       .join('&');
  //     return this.http.get(`${this.apiUrl}/correspondencia?${query}`);
  //   }
  //   return this.http.get(`${this.apiUrl}/correspondencia`);
  // }

  /**
   * Actualiza una correspondencia existente (edición)
   * PUT /CorrespondenciaRoutes/correspondencia/editar-observaciones
   * @param formData FormData con los campos y archivo PDF (opcional)
   */
  updateCorrespondence(formData: FormData) {
    return this.http.put(
      `${this.apiUrl}/CorrespondenciaRoutes/correspondencia/editar-observaciones`,
      formData
    );
  }

  deleteCorrespondence(id: number) {
    return this.http.delete(`${this.apiUrl}/eliminarCorrespondencia/${id}`);
  }

  // Nuevo método para filtrar correspondencias por ID
  filterCorrespondences(filtros: any) {
    return this.http.post(
      `${this.apiUrl}/CorrespondenciaRoutes/correspondencia`,
      filtros
    );
  }

  getObservacionesById(id_correspondencia_usuario: number) {
    return this.http.get(
      `${this.apiUrl}/CorrespondenciaRoutes/observaciones/${id_correspondencia_usuario}`
    );
  }

  editarObservaciones(payload: any) {
    return this.http.post(
      `${this.apiUrl}/CorrespondenciaRoutes/editarobservaciones`,
      payload
    );
  }

  getEstadosCorrespondencia() {
    return this.http.get(
      `${this.apiUrl}/CorrespondenciaRoutes/estadosCorrespondencia`
    );
  }

  // Se usa el endpoint del backend para buscar personas por área, puesto o nombre
  obtenerUsuarios(query: string) {
    const token = localStorage.getItem('token'); // Se ajusta según se guarde   el JWT
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .post<any>(`${this.apiUrl}/CorrespondenciaRoutes/areaPuestoNombre`, {
        query,
      })
      .pipe(
        map((res) => {
          // console.log('[obtenerUsuarios] Respuesta del Back:', res); // <-- LOG
          // Si se muestra un array, se retorna directamente
          if (Array.isArray(res)) return res;
          // Si es un objeto y tiene propiedades esperadas, se retorna el array
          if (res && typeof res === 'object') {
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res.personas)) return res.personas;
            if (Array.isArray(res.resultados)) return res.resultados;
          }
          //Si no se encuentra un array, se retorna un array vacío
          return [];
        })
      );
  }

  // Método para obtener todos los usuarios/remitentes con área y puesto
  obtenerTodosLosRemitentes() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    // Enviamos un query vacío para traer todos
    return this.http
      .post<any>(
        `${this.apiUrl}/CorrespondenciaRoutes/areaPuestoNombre`,
        { query: '' },
        { headers }
      )
      .pipe(
        map((res) => {
          if (Array.isArray(res)) return res;
          if (res && typeof res === 'object') {
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res.personas)) return res.personas;
            if (Array.isArray(res.resultados)) return res.resultados;
          }
          return [];
        })
      );
  }

  // Método para obtener el PDF de correspondencia como Blob segun el sensei
  // getCorrespondencePDF(archivo: string) {
  //   const token =
  //     localStorage.getItem('token') || sessionStorage.getItem('token');
  //   let headers = new HttpHeaders();
  //   if (token) {
  //     headers = headers.append('Authorization', `Bearer ${token}`);
  //   }
  //
  //   // Siempre usa el endpoint correcto que sí abre el PDF
  //   let pdfUrl = `${this.apiUrl}/pdf/correspondenciaFile/${archivo}`;
  //   return this.http.get(pdfUrl, { responseType: 'blob', headers });
  // }

  // Método para obtener el PDF de correspondencia usando el nuevo endpoint seguro
  getCorrespondenceDocument(fileRoute: string) {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }
    const url = `${this.apiUrl}/CorrespondenciaRoutes/Documentscorrespondencia/${fileRoute}`;
    return this.http.get(url, { responseType: 'blob', headers });
  }
  // Método para exportar correspondencias a Excel en el módulo de correspondencia principal
  exportToExcel() {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }
    return this.http.get(`${this.apiUrl}/excel/correspondencias/excel`, {
      responseType: 'arraybuffer',
      headers,
    });
  }

  // Método para exportar correspondencias diarias (por fechas)
  exportExcelByDates(startDate: string, endDate: string) {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/excel/correspondencias/diarias`, {
      responseType: 'arraybuffer',
      headers,
      params,
    });
  }

  // Método para exportar correspondencias mensuales
  exportExcelMonthly() {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}/excel/correspondencias/mensuales`, {
      responseType: 'arraybuffer',
      headers,
    });
  }

  // Método correcto para obtener el resumen de correspondencia por área
  obtenerResumenPorArea(fecha?: string, rl_usuario_puesto_id?: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    let url = `${this.apiUrl}/CorrespondenciaRoutes/correspondenciaArea`;
    const params: string[] = [];
    if (fecha) {
      params.push(`fechaInicio=${encodeURIComponent(fecha)}`);
    }
    if (rl_usuario_puesto_id) {
      params.push(
        `rl_usuario_puesto_id=${encodeURIComponent(rl_usuario_puesto_id)}`
      );
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<any>(url, { headers }).pipe(map((res) => res));
  }

  /**
   * Descarga el Acuse de correspondencia generado por el backend
   */
  downloadCorrespondencePdf(id_correspondencia: number) {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }
    const url = `${this.apiUrl}/CorrespondenciaRoutes/correspondencia/pdf/${id_correspondencia}`;
    return this.http.get(url, { responseType: 'blob', headers });
  }

  editCorrespondenceFull(formData: FormData) {
    return this.http.post(
      `${this.apiUrl}/CorrespondenciaRoutes/editarCorrespondencia`,
      formData
    );
  }
}
