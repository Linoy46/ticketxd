import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FinancingItem,
  FinancingResponse,
  FinancingSingleResponse,
  FinancingGenericResponse
} from '../interfaces/financing.interface';
import { environment } from '../../../../../environments/environment';
import { Area } from '../../budgets/interfaces/budgets.interface';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FinancingService {
  private baseUrl = `${environment.apiUrlPromette}/budget`;
  private adminUrl = `${environment.apiUrlPromette}/administrativeUnits`;

  constructor(private http: HttpClient) { }

  getFinancingItems(userId: number): Observable<FinancingResponse> {
    return this.http.get<FinancingResponse>(`${this.baseUrl}/user/${userId}`);
  }

  getFinancingItem(id_financiamiento: number): Observable<FinancingSingleResponse> {
    return this.http.get<FinancingSingleResponse>(`${this.baseUrl}/item/${id_financiamiento}`);
  }

  createFinancingItem(item: FinancingItem): Observable<FinancingGenericResponse> {
    return this.http.post<FinancingGenericResponse>(`${this.baseUrl}/`, item);
  }

  updateFinancingItem(item: FinancingItem): Observable<FinancingGenericResponse> {
    return this.http.put<FinancingGenericResponse>(`${this.baseUrl}/`, item);
  }

  deleteFinancingItem(id_financiamiento: number): Observable<FinancingGenericResponse> {
    return this.http.delete<FinancingGenericResponse>(`${this.baseUrl}/`, {
      body: { id_financiamiento }
    });
  }

  // Obtener áreas por analista desde rl_analista_unidad
  getAreasByAnalyst(userId: number): Observable<{ areas: Area[] }> {
    return this.http.get<{ areas: Area[] }>(`${this.adminUrl}/analyst/areas/${userId}`).pipe(
      tap(response => {
        console.log('Áreas obtenidas desde rl_analista_unidad:', response.areas);
      })
    );
  }
}
