import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = environment.apiUrlPromette;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la información de la última vez que el usuario inició sesión
   * @returns Observable con la fecha de último inicio de sesión
   */
  getLastLogin(): Observable<any> {
    // En un entorno real, esto obtendría datos del backend
    // Por ahora, simulamos con una fecha de ejemplo
    return of({
      success: true,
      lastLogin: new Date().toISOString(),
    }).pipe(
      catchError((error) => {
        console.error(
          'Error obteniendo fecha de último inicio de sesión:',
          error
        );
        return of({ success: false, lastLogin: null });
      })
    );
  }

  /**
   * Obtiene las estadísticas para mostrar en el dashboard
   * @returns Observable con las estadísticas
   */
  getDashboardStats(): Observable<any> {
    // Para una implementación futura
    return of({
      success: true,
      stats: {
        totalInventory: 245,
        outstandingOrders: 12,
        recentActivity: 35,
      },
    });
  }
}
