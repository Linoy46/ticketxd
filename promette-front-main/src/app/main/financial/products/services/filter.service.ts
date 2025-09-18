import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Product, ProductFilterParams } from '../interfaces/products.interface';

/**
 * Servicio para gestionar el filtrado y ordenamiento de productos
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {
  // Estado de los filtros
  private searchTermSubject = new BehaviorSubject<string>('');
  private priceRangeSubject = new BehaviorSubject<[number, number]>([0, 999999999]);
  private sortBySubject = new BehaviorSubject<string>('id_producto');
  private sortDirectionSubject = new BehaviorSubject<'asc' | 'desc'>('asc');

  // Observables públicos
  public searchTerm$ = this.searchTermSubject.asObservable();
  public priceRange$ = this.priceRangeSubject.asObservable();
  public sortBy$ = this.sortBySubject.asObservable();
  public sortDirection$ = this.sortDirectionSubject.asObservable();

  constructor() {}

  /**
   * Establece el término de búsqueda
   */
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  /**
   * Establece el rango de precios
   */
  setPriceRange(range: [number, number]): void {
    this.priceRangeSubject.next(range);
  }

  /**
   * Establece el campo por el cual ordenar
   */
  setSortBy(field: string): void {
    this.sortBySubject.next(field);
  }

  /**
   * Establece la dirección del ordenamiento
   */
  setSortDirection(direction: 'asc' | 'desc'): void {
    this.sortDirectionSubject.next(direction);
  }

  /**
   * Resetea todos los filtros a sus valores iniciales
   */
  resetFilters(): void {
    this.searchTermSubject.next('');
    this.priceRangeSubject.next([0, 999999999]);
    this.sortBySubject.next('id_producto');
    this.sortDirectionSubject.next('asc');
  }

  /**
   * Obtiene los parámetros actuales para llamadas a la API
   */
  getCurrentFilterParams(): ProductFilterParams {
    return {
      searchTerm: this.searchTermSubject.value || undefined,
      precioMin: this.priceRangeSubject.value[0],
      precioMax: this.priceRangeSubject.value[1],
      sortBy: this.sortBySubject.value,
      sortDirection: this.sortDirectionSubject.value
    };
  }

  /**
   * Filtra los productos según los criterios establecidos
   */
  getFilteredProducts(products: Product[]) {
    return combineLatest([
      this.searchTerm$,
      this.sortBy$,
      this.sortDirection$
    ]).pipe(
      map(([searchTerm, sortBy, sortDirection]) => {
        let filtered = [...products];

        // Aplicar filtro de búsqueda
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(product =>
            product.nombre_producto.toLowerCase().includes(term) ||
            (product.ct_partida?.clave_partida || '').toLowerCase().includes(term) ||
            (product.ct_partida?.nombre_partida || '').toLowerCase().includes(term) ||
            (product.ct_unidad?.clave_unidad || '').toLowerCase().includes(term) ||
            product.precio.toString().includes(term) ||
            product.id_producto.toString().includes(term)
          );
        }

        // Filtro de precio removido - se muestran todos los productos sin restricción de precio
        

        // Ordenar resultados
        filtered.sort((a, b) => {
          if (sortBy === "id_producto") {
            return sortDirection === "asc" ?
              a.id_producto - b.id_producto :
              b.id_producto - a.id_producto;
          } else if (sortBy === "nombre_producto") {
            return sortDirection === "asc" ?
              a.nombre_producto.localeCompare(b.nombre_producto) :
              b.nombre_producto.localeCompare(a.nombre_producto);
          } else if (sortBy === "precio") {
            return sortDirection === "asc" ?
              a.precio - b.precio :
              b.precio - a.precio;
          }
          return 0;
        });

        return filtered;
      })
    );
  }
}
