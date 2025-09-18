import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Capitulo,
  ChapterDetailResponse,
  ChapterResponse,
  Concepto,
  ItemDetailResponse,
  ItemResponse
} from '../interfaces/spending.interface';

@Injectable({
  providedIn: 'root'
})
export class SpendingObjectsService {
  private apiUrl = environment.apiUrlPromette;

  constructor(private http: HttpClient) { }

  // Chapter endpoints (Capítulos)
  getAllChapters(): Observable<Capitulo[]> {
    return this.http.get<ChapterResponse>(`${this.apiUrl}/chapter`)
      .pipe(map(response => response.chapters));
  }

  getChapterById(id: number): Observable<Capitulo> {
    return this.http.get<ChapterDetailResponse>(`${this.apiUrl}/chapter/${id}`)
      .pipe(map(response => response.chapter));
  }

  createChapter(chapter: Capitulo): Observable<Capitulo> {
    return this.http.post<ChapterDetailResponse>(`${this.apiUrl}/chapter`, chapter)
      .pipe(map(response => response.chapter));
  }

  updateChapter(id: number, chapter: Capitulo): Observable<Capitulo> {
    return this.http.put<ChapterDetailResponse>(`${this.apiUrl}/chapter/${id}`, chapter)
      .pipe(map(response => response.chapter));
  }

  deleteChapter(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/chapter/${id}`);
  }

  // Item endpoints (Partidas)
  getAllItems(): Observable<Concepto[]> {
    return this.http.get<ItemResponse>(`${this.apiUrl}/item`)
      .pipe(map(response => response.items));
  }

  getItemById(id: number): Observable<Concepto> {
    return this.http.get<ItemDetailResponse>(`${this.apiUrl}/item/${id}`)
      .pipe(map(response => response.item));
  }

  getItemsByChapter(chapterId: number): Observable<Concepto[]> {
    return this.http.get<ItemResponse>(`${this.apiUrl}/item/chapter/${chapterId}`)
      .pipe(map(response => response.items));
  }

  createItem(item: Concepto): Observable<Concepto> {
    return this.http.post<ItemDetailResponse>(`${this.apiUrl}/item`, item)
      .pipe(map(response => response.item));
  }

  updateItem(id: number, item: Concepto): Observable<Concepto> {
    return this.http.put<ItemDetailResponse>(`${this.apiUrl}/item/${id}`, item)
      .pipe(map(response => response.item));
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/item/${id}`);
  }

  // Convenience methods for the component
  getFormattedData(): Observable<any[]> {
    return this.getAllItems().pipe(
      map(items => {
        return items.map(item => {
          return {
            id: item.id_partida,
            capitulo: item.ct_capitulo?.nombre_capitulo || '',
            concepto: item.nombre_partida,
            clave: item.clave_partida,
            especifica: item.nombre_partida
          };
        });
      })
    );
  }
}
