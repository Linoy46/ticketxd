import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private csrfTokenUrl = '/api/csrf-token'; // URL del endpoint que devuelve el CSRF token

  constructor(private http: HttpClient) { }

  // Método para obtener el CSRF token
  getCsrfToken(): Observable<string> {
    return this.http.get<string>(this.csrfTokenUrl);
  }
}
