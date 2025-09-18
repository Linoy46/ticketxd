import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  tap,
  throwError,
} from 'rxjs';
import {
  Product,
  ProductFilterParams,
  CreateProductDto,
  UpdateProductDto,
  ApiResponse,
  PaginatedResponse,
  MeasurementUnit,
  Item,
} from '../interfaces/products.interface';
import { environment } from '../../../../../environments/environment';

/**
 * Servicio para la gestión de productos consumibles
 * Maneja todas las operaciones CRUD y la comunicación con el API
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = `${environment.apiUrlPromette}/consumableProduct`;
  private itemsUrl = `${environment.apiUrlPromette}/item`;
  private unitsUrl = `${environment.apiUrlPromette}/measurementUnit`;

  // BehaviorSubjects para manejar el estado de la aplicación
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  private unitsSubject = new BehaviorSubject<MeasurementUnit[]>([]);

  // Observables públicos que se pueden suscribir desde los componentes
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public products$ = this.productsSubject.asObservable();
  public items$ = this.itemsSubject.asObservable();
  public units$ = this.unitsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Inicializa los datos necesarios para el módulo de productos
   */
  initialize(): void {
    this.loadAllItems();
    this.loadAllMeasurementUnits();
    this.loadAllProducts();
  }

  /**
   * Gestiona errores y actualiza el estado del error
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en ProductsService:', error);
    const errorMessage =
      error.error?.msg || 'Ha ocurrido un error. Intente nuevamente.';
    this.errorSubject.next(errorMessage);
    return throwError(() => error);
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.errorSubject.next('');
  }

  /**
   * Obtiene todos los productos consumibles
   */
  loadAllProducts(): void {
    this.loadingSubject.next(true);

    this.http
      .get<{ products: Product[] }>(`${this.apiUrl}`)
      .pipe(
        map((response) => response.products || []),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((products) => {
        this.productsSubject.next(products);
      });
  }

  /**
   * Obtiene productos filtrados según los criterios especificados
   * @param params Parámetros de filtrado
   */
  filterProducts(params: ProductFilterParams): void {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.append(key, value.toString());
      }
    });

    this.http
      .get<PaginatedResponse<Product>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response) => response.items || []),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((products) => {
        this.productsSubject.next(products);
      });
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto
   */
  getProductById(id: number): Observable<Product> {
    this.loadingSubject.next(true);

    return this.http.get<{ product: Product }>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.product),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Crea un nuevo producto
   * @param product Datos del nuevo producto
   */
  createProduct(product: CreateProductDto): Observable<Product> {
    this.loadingSubject.next(true);

    return this.http
      .post<{ product: Product; msg: string }>(this.apiUrl, product)
      .pipe(
        map((response) => response.product),
        tap((newProduct) => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([...currentProducts, newProduct]);
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param product Datos actualizados del producto
   */
  updateProduct(id: number, product: UpdateProductDto): Observable<Product> {
    this.loadingSubject.next(true);

    return this.http
      .put<{ product: Product; msg: string }>(`${this.apiUrl}/${id}`, product)
      .pipe(
        map((response) => response.product),
        tap((updatedProduct) => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next(
            currentProducts.map((p) =>
              p.id_producto === updatedProduct.id_producto ? updatedProduct : p
            )
          );
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  deleteProduct(id: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, null);
  }


  /**
   * Carga todas las partidas disponibles
   */
  loadAllItems(): void {
    this.loadingSubject.next(true);

    this.http
      .get<{ items: Item[] }>(`${this.itemsUrl}`)
      .pipe(
        map((response) => {
          // Asegurarse de que las partidas tengan el formato correcto
          const items = response.items || [];
          return items.map((item) => ({
            id_partida: item.id_partida,
            clave_partida: item.clave_partida || '',
            nombre_partida: item.nombre_partida || '',
            estado: item.estado,
          }));
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((items) => {
        console.log('Partidas cargadas:', items);
        this.itemsSubject.next(items);
      });
  }

  /**
   * Carga todas las unidades de medida
   */
  loadAllMeasurementUnits(): void {
    this.loadingSubject.next(true);

    this.http
      .get<{ units: MeasurementUnit[] }>(`${this.unitsUrl}`)
      .pipe(
        map((response) => response.units || []),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((units) => {
        this.unitsSubject.next(units);
      });
  }

  /**
   * Convierte un valor numérico a formato de moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }
}
