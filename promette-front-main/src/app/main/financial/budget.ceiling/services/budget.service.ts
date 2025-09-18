import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  of,
  take,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  BudgetCeiling,
  BudgetCeilingResponse,
  BudgetCeilingsResponse,
  BudgetCeilingViewModel,
  CreateBudgetCeilingDto,
  UpdateBudgetCeilingDto,
  BasicUser,
  Capitulo,
  Financiamiento,
} from '../interfaces/budget.interfaces';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private apiUrl = `${environment.apiUrlPromette}/budgetCeiling`;
  private areasUrl = `${environment.apiUrlPromette}/administrativeUnits`;
  private usersUrl = `${environment.apiUrlPromette}/user`;
  private capituloUrl = `${environment.apiUrlPromette}/chapter`;
  private financiamientoUrl = `${environment.apiUrlPromette}/budget`;

  // BehaviorSubjects para mantener el estado de la aplicación
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');
  private ceilingsSubject = new BehaviorSubject<BudgetCeiling[]>([]);
  private areasSubject = new BehaviorSubject<any[]>([]);
  private capitulosSubject = new BehaviorSubject<Capitulo[]>([]);
  private financiamientosSubject = new BehaviorSubject<Financiamiento[]>([]);
  private totalsByAreaSubject = new BehaviorSubject<any[]>([]);

  // Observables públicos que se pueden suscribir desde los componentes
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public ceilings$ = this.ceilingsSubject.asObservable();
  public areas$ = this.areasSubject.asObservable();
  public capitulos$ = this.capitulosSubject.asObservable();
  public financiamientos$ = this.financiamientosSubject.asObservable();
  public totalsByArea$ = this.totalsByAreaSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Inicializa los datos necesarios para el módulo
   */
  initialize(): void {
    this.loadAllAreas();
    this.loadAllCeilings();
    this.loadAllCapitulos();
    this.loadAllFinanciamientos();
    this.loadTotalsByArea();
  }

  /**
   * Gestiona errores y actualiza el estado del error
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en BudgetService:', error);
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
   * Obtiene todos los techos presupuestales
   */
  loadAllCeilings(): void {
    this.loadingSubject.next(true);

    this.http
      .get<BudgetCeilingsResponse>(this.apiUrl)
      .pipe(
        map((response) => response.ceilings || []),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((ceilings) => {
        this.ceilingsSubject.next(ceilings);
      });
  }

  /**
   * Obtiene todas las áreas para utilizar en formularios
   */
  loadAllAreas(): void {
    this.loadingSubject.next(true);
    console.log('Cargando áreas desde:', this.areasUrl);

    this.http
      .get<any>(this.areasUrl)
      .pipe(
        map((response) => {
          console.log('Respuesta de áreas:', response);
          // ✅ La respuesta de administrativeUnits viene como { administrativeUnits: [...] }
          return response.administrativeUnits || [];
        }),
        catchError((error) => {
          console.error('Error al cargar áreas:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error details:', error.error);
          return this.handleError(error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((areas) => {
        console.log('✅ Áreas cargadas desde administrativeUnits:', areas);
        this.areasSubject.next(areas);
      });
  }

  /**
   * Obtiene todos los capítulos para utilizar en formularios
   */
  loadAllCapitulos(): void {
    this.loadingSubject.next(true);
    console.log('Cargando capítulos desde:', this.capituloUrl);

    this.http
      .get<any>(this.capituloUrl)
      .pipe(
        map((response) => {
          console.log('Respuesta de capítulos:', response);
          return response.chapters || [];
        }),
        catchError((error) => {
          console.error('Error al cargar capítulos:', error);
          return this.handleError(error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((capitulos) => {
        console.log('Capítulos cargados:', capitulos);
        this.capitulosSubject.next(capitulos);
      });
  }

  /**
   * Obtiene todos los tipos de financiamiento para utilizar en formularios
   */
  loadAllFinanciamientos(): void {
    this.loadingSubject.next(true);
    console.log('Cargando financiamientos desde:', this.financiamientoUrl);

    this.http
      .get<any>(this.financiamientoUrl)
      .pipe(
        map((response) => {
          console.log('Respuesta de financiamientos:', response);
          // Asegurarse de acceder correctamente al array de financiamientos según la estructura de respuesta
          return response.financiamientos || response.data || response || [];
        }),
        catchError((error) => {
          console.error('Error al cargar financiamientos:', error);
          return this.handleError(error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((financiamientos) => {
        console.log('Financiamientos cargados:', financiamientos);
        this.financiamientosSubject.next(financiamientos);
      });
  }

  /**
   * Carga los totales de presupuesto por área
   */
  loadTotalsByArea(): void {
    this.loadingSubject.next(true);
    console.log('Cargando totales por área desde:', `${this.apiUrl}/totals/areas`);

    this.http
      .get<any>(`${this.apiUrl}/totals/areas`)
      .pipe(
        map((response) => {
          console.log('Respuesta de totales por área:', response);
          return response.totals || [];
        }),
        catchError((error) => {
          console.error('Error al cargar totales por área:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error details:', error.error);
          return this.handleError(error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((totals) => {
        console.log('Totales por área cargados:', totals);
        this.totalsByAreaSubject.next(totals);
      });
  }

  /**
   * Obtiene los totales de presupuesto para un área específica
   */
  getTotalsByAreaId(areaId: number): Observable<any> {
    this.loadingSubject.next(true);

    return this.http.get<any>(`${this.apiUrl}/totals/area/${areaId}`).pipe(
      map((response) => response.areaSummary),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Obtiene un techo presupuestal por su ID
   */
  getCeilingById(id: number): Observable<BudgetCeiling> {
    this.loadingSubject.next(true);

    return this.http.get<BudgetCeilingResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.ceiling),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Crea un nuevo techo presupuestal
   */
  createCeiling(data: CreateBudgetCeilingDto): Observable<BudgetCeiling> {
    this.loadingSubject.next(true);

    return this.http
      .post<{ ceiling: BudgetCeiling; msg: string }>(this.apiUrl, data)
      .pipe(
        map((response) => response.ceiling),
        tap((newCeiling) => {
          const currentCeilings = this.ceilingsSubject.value;
          this.ceilingsSubject.next([...currentCeilings, newCeiling]);
          // Actualizar también los totales
          this.loadTotalsByArea();
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Actualiza un techo presupuestal existente
   */
  updateCeiling(
    id: number,
    data: UpdateBudgetCeilingDto
  ): Observable<BudgetCeiling> {
    this.loadingSubject.next(true);

    return this.http
      .put<{ ceiling: BudgetCeiling; msg: string; proyectosActualizados: number; diferencia: number }>(
        `${this.apiUrl}/${id}`,
        data
      )
      .pipe(
        map((response) => {
          console.log('✅ Techo presupuestal actualizado exitosamente');
          console.log(`📊 Proyectos anuales actualizados: ${response.proyectosActualizados}`);
          console.log(`💰 Diferencia en monto: ${response.diferencia}`);
          return response.ceiling;
        }),
        tap((updatedCeiling) => {
          const currentCeilings = this.ceilingsSubject.value;
          this.ceilingsSubject.next(
            currentCeilings.map((c) =>
              c.id_techo === updatedCeiling.id_techo ? updatedCeiling : c
            )
          );
          // Actualizar también los totales
          this.loadTotalsByArea();
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Convierte los datos del techo presupuestal a un formato para visualización
   * Muestra el nombre del área según el catálogo de infraestructura
   */
  mapCeilingsToViewModel(ceilings: BudgetCeiling[]): BudgetCeilingViewModel[] {
    const areasInfra = this.areasSubject.value;

    console.log('DEBUG - Áreas administrativas:', areasInfra);
    console.log('DEBUG - Techos recibidos:', ceilings);

    return ceilings.map((ceiling: BudgetCeiling) => {
      let areaName = 'No asignada';
      let areaId = ceiling.ct_area_id;
      let idFinanciero: number | undefined = undefined;

      if (areasInfra && Array.isArray(areasInfra)) {
        const area = areasInfra.find(
          (a: any) => a.id_area_fin === ceiling.ct_area_id
        );

        console.log(
          `DEBUG - Buscando área con id_area_fin=${ceiling.ct_area_id}:`,
          area
        );

        if (area) {
          areaName = area.nombre || 'Sin nombre';
          areaId = area.id_area_fin;
          idFinanciero = area.id_financiero;
        }
      }

      return {
        id: ceiling.id_techo,
        idFinanciero: idFinanciero, //
        areaName: areaName,
        areaId: areaId,
        userName:
          ceiling.ct_usuario_in_ct_usuario?.nombre_usuario || 'No asignado',
        capituloName: ceiling.ct_capitulo?.nombre_capitulo || 'No asignado',
        capituloId: ceiling.ct_capitulo_id,
        financiamientoName:
          ceiling.ct_financiamiento?.nombre_financiamiento || 'No asignado',
        financiamientoId: ceiling.ct_financiamiento_id,
        presupuestado: ceiling.cantidad_presupuestada,
        createdBy:
          ceiling.ct_usuario_in_ct_usuario?.nombre_usuario ||
          'Usuario desconocido',
        updatedBy: ceiling.ct_usuario_at_ct_usuario?.nombre_usuario,
        createdAt: ceiling.createdAt,
        updatedAt: ceiling.updatedAt,
        formattedPresupuesto: this.formatCurrency(
          ceiling.cantidad_presupuestada
        ),
      };
    });
  }

  /**
   * Formatea un valor numérico como moneda
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value || 0);
  }

  /**
   * Obtiene todos los usuarios para usar en los forms
   */
  getUsers(): Observable<BasicUser[]> {
    this.loadingSubject.next(true);

    return this.http.get<{ users: BasicUser[] }>(`${this.usersUrl}`).pipe(
      map((response) => response.users || []),
      catchError((error) => {
        this.handleError(error);
        return of([]); // Retorna un array vacío en caso de error
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Exporta los techos presupuestales a Excel
   */
  exportToExcel(): Observable<Blob> {
    this.loadingSubject.next(true);

    return this.http
      .get(`${this.apiUrl}/export/excel`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          // Extraer el nombre del archivo de los headers si está disponible
          let filename = 'Techos_Presupuestales.xlsx';
          const contentDisposition = response.headers.get(
            'content-disposition'
          );
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition
            );
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          // Guardar el nombre del archivo para usarlo cuando se descargue
          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          // Crear un elemento <a> para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();

          // Limpiar el objeto URL
          window.URL.revokeObjectURL(url);

          return blob;
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.loadingSubject.next(false))
      );
  }
}
