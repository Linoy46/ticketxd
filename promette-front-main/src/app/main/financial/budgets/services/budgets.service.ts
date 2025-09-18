import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Area, BudgetItem, ApiResponse } from '../interfaces/budgets.interface';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';

@Injectable({
  providedIn: 'root',
})
export class BudgetsService {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector();
  }

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );
  // Aquí se obtiene el usuario con un getter
  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
  private readonly apiBaseUrl = environment.apiUrlPromette;

  // ✅ BehaviorSubjects corregidos para manejo de estado
  private readonly budgetCeilingsSubject = new BehaviorSubject<any[]>([]);
  private readonly filteredBudgetsSubject = new BehaviorSubject<BudgetItem[]>(
    []
  );
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string>('');

  // ✅ Cache para áreas administrativas con nombres correctos
  private administrativeUnitsMap = new Map<number, Area>();

  // Observables públicos
  public readonly budgetCeilings$ = this.budgetCeilingsSubject.asObservable();
  public readonly filteredBudgets$ = this.filteredBudgetsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  // ✅ AÑADIR: BehaviorSubject para proyectos anuales
  private anualProjectsSubject = new BehaviorSubject<any[]>([]);
  public anualProjects$ = this.anualProjectsSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * ✅ CORRECCIÓN: Carga áreas administrativas desde administrativeUnits
   * Estas contienen la relación correcta con id_area_fin como primary key
   */
  private loadAdministrativeUnits(): Observable<void> {
    return this.http
      .get<{ administrativeUnits: any[] }>(
        `${this.apiBaseUrl}/administrativeUnits`
      )
      .pipe(
        map((response) => {
          this.administrativeUnitsMap.clear();

          if (response.administrativeUnits) {
            response.administrativeUnits.forEach((unit) => {
              // ✅ MAPEAR CORRECTAMENTE: usar id_area_fin como key principal
              const area: Area = {
                id_area: unit.id_area_fin, // ✅ FUNCIONAL - usar id_area_fin como id_area
                id_area_fin: unit.id_area_fin, // ✅ PRIMARY KEY de rl_area_financiero
                id_financiero: unit.id_financiero, // ✅ INFORMATIVO
                id_area_infra: unit.id_area_infra, // ✅ VINCULACIÓN con API externa
                nombre_area: unit.nombre, // ✅ Nombre correcto de la API de infraestructura
                nombre: unit.nombre, // Alias para compatibilidad
                estado: 1, // Activo por defecto
              };

              this.administrativeUnitsMap.set(unit.id_area_fin, area);
            });
          }

          console.log(
            '✅ Áreas administrativas cargadas:',
            this.administrativeUnitsMap.size
          );
        }),
        catchError((error) => {
          console.error('❌ Error al cargar áreas administrativas:', error);
          return of(void 0);
        })
      );
  }

  /**
   * ✅ MEJORAR: Cargar proyectos anuales para obtener información de monto disponible
   */
  private loadAnualProjects(): Observable<any[]> {
    return this.http.get<any>(`${this.apiBaseUrl}/anualProject`).pipe(
      map((response) => {
        console.log('📊 Proyectos anuales cargados:', response);
        const projects = response.projects || [];
        this.anualProjectsSubject.next(projects);
        return projects;
      }),
      catchError((error) => {
        console.error('❌ Error al cargar proyectos anuales:', error);
        return of([]);
      })
    );
  }

  /**
   * ✅ CORRECCIÓN: Carga techos presupuestales desde budgetCeiling
   */
  loadBudgetCeilings(): Observable<any[]> {
    this.setLoading(true);

    return this.loadAdministrativeUnits().pipe(
      switchMap(() => this.loadAnualProjects()), // ✅ CARGAR PROYECTOS ANUALES
      switchMap(() =>
        this.http.get<{ success: boolean; ceilings: any[] }>(
          `${this.apiBaseUrl}/budgetCeiling`
        )
      ),
      map((response) => {
        const ceilings = response.ceilings || [];
        console.log('✅ Techos presupuestales cargados:', ceilings.length);

        this.budgetCeilingsSubject.next(ceilings);
        return ceilings;
      }),
      catchError((error) => {
        console.error('❌ Error al cargar techos presupuestales:', error);
        this.setError('Error al cargar techos presupuestales');
        return of([]);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * ✅ CORRECCIÓN: Transformación de techos presupuestales a datos de tabla
   * Ahora incluye información de proyectos anuales para cálculo de monto disponible
   */
  transformBudgetCeilingsToTableData(ceilings: any[]): BudgetItem[] {
    console.log(
      '🔄 Transformando techos presupuestales con información de proyectos anuales...'
    );

    const anualProjects = this.anualProjectsSubject.getValue();
    console.log('📊 Proyectos anuales disponibles:', anualProjects.length);

    // ✅ DEBUG: Verificar información del usuario
    console.log('👤 Información del usuario:', {
      userId: this.user.id_usuario,
      nombre: this.user.nombre_usuario,
      puestos: this.user.rl_usuario_puestos,
    });

    // Verificar si el usuario tiene ambos puestos
    const userPuestos = this.user.rl_usuario_puestos as {
      ct_puesto_id: number;
    }[];
    const isAnalyst = userPuestos.some((puesto) => puesto.ct_puesto_id === 258);
    const hasSpecialRole = userPuestos.some(
      (puesto) => puesto.ct_puesto_id === 1806
    );
    const showAll = isAnalyst && hasSpecialRole;

    // ✅ CORRECCIÓN: Para analistas, no filtrar por áreas del usuario
    // Las áreas asignadas al analista se manejan en el backend
    let userAreas: number[] = [];

    // Solo obtener áreas del usuario si NO es analista y NO tiene rol especial
    if (!isAnalyst && !hasSpecialRole) {
      userAreas = this.user.rl_usuario_puestos
        .map((puesto: any) => puesto.ct_puesto?.ct_area_id)
        .filter((areaId: any) => typeof areaId === 'number');
    }

    console.log('Usuario es analista:', isAnalyst);
    console.log('Usuario tiene rol especial:', hasSpecialRole);
    console.log('Mostrar todo:', showAll);
    console.log('Áreas asociadas al usuario:', userAreas);
    console.log('Total de techos a procesar:', ceilings.length);
    console.log('Pruebas', ceilings);
    const result = ceilings.map((ceiling) => {
      console.log('🔍 Buscando área para ct_area_id:', ceiling.ct_area_id);
      let areaName = 'Área no asignada';
      let areaFinId = ceiling.ct_area_id;
      let areaInfraId: number | undefined = undefined;
      let idFinanciero: number | undefined = undefined;

      // Buscar área usando el ID
      const area = this.administrativeUnitsMap.get(ceiling.ct_area_id);

      if (area) {
        areaName = area.nombre_area || area.nombre || 'Sin nombre';
        areaFinId = area.id_area_fin;
        areaInfraId = area.id_area_infra;
        idFinanciero = area.id_financiero;

        console.log(
          `✅ Área encontrada: ${areaName} (id_area_fin: ${areaFinId})`
        );
      } else {
        console.warn(
          `⚠️ Área no encontrada para ct_area_id: ${ceiling.ct_area_id}`
        );
      }

      // Buscar proyecto anual asociado al techo presupuestal
      const proyectoAnual = anualProjects.find(
        (project) => project.dt_techo_id === ceiling.id_techo
      );

      let utilizado = 0;
      let disponible = Number(ceiling.cantidad_presupuestada) || 0;
      let porcentajeUtilizado = 0;

      // Si hay proyecto anual, usar sus valores, si no, mantener los valores por defecto
      if (proyectoAnual) {
        utilizado = Number(proyectoAnual.monto_utilizado) || 0;
        disponible = Number(ceiling.cantidad_presupuestada) - utilizado;

        const presupuestado = Number(ceiling.cantidad_presupuestada) || 0;
        if (presupuestado > 0) {
          porcentajeUtilizado = (utilizado / presupuestado) * 100;
        }
      } else {
        // Si no hay proyecto anual, el monto disponible es igual al presupuestado
        disponible = Number(ceiling.cantidad_presupuestada) || 0;
        utilizado = 0;
        porcentajeUtilizado = 0;
      }

      return {
        idTecho: ceiling.id_techo,
        unidad: areaName,
        areaId: areaFinId,
        areaInfraId: areaInfraId,
        idFinanciero: idFinanciero,
        fuente:
          ceiling.ct_financiamiento?.nombre_financiamiento ||
          'Sin financiamiento',
        capitulo: ceiling.ct_capitulo?.nombre_capitulo || 'Sin capítulo',
        presupuestado: Number(ceiling.cantidad_presupuestada) || 0,
        utilizado: utilizado,
        disponible: disponible,
        porcentajeUtilizado: Math.round(porcentajeUtilizado * 100) / 100,
        originalData: ceiling,
      };
    });

    console.log('✅ Techos transformados:', result.length);

    // ✅ CORRECCIÓN: Lógica de filtrado simplificada
    if (showAll || isAnalyst) {
      // Si tiene ambos puestos o es analista, mostrar todo (el backend ya filtró)
      console.log(
        `✅ Mostrando todos los techos (${result.length}) para analista o usuario con rol especial`
      );
      return result;
    } else {
      // ✅ CORRECCIÓN: Para usuarios regulares, mostrar todos los techos que el backend envió
      // El backend ya filtró correctamente según el ct_area_id del puesto del usuario
      console.log(
        `✅ Usuario regular - Mostrando todos los techos enviados por el backend: ${result.length} techos`
      );
      console.log(
        `✅ El backend ya aplicó el filtro según ct_area_id del puesto del usuario`
      );
      return result;
    }
  }

  loadAllBudgetData(): Observable<BudgetItem[]> {
    console.log(
      '🚀 Iniciando carga completa de datos presupuestales con proyectos anuales...'
    );

    return this.loadBudgetCeilings().pipe(
      map((ceilings) => {
        console.log('✅ Ejecutando transformBudgetCeilingsToTableData...');
        const transformedData =
          this.transformBudgetCeilingsToTableData(ceilings);
        this.updateFilteredData(transformedData);
        return transformedData;
      }),
      catchError((error) => {
        console.error('❌ Error en carga completa:', error);
        this.setError('Error al cargar datos presupuestales');
        return of([]);
      })
    );
  }

  /**
   * ✅ MÉTODO AUXILIAR: Actualiza datos filtrados
   */
  private updateFilteredData(data?: BudgetItem[]): void {
    if (data) {
      this.filteredBudgetsSubject.next(data);
    } else {
      const ceilings = this.budgetCeilingsSubject.getValue();
      const transformedData = this.transformBudgetCeilingsToTableData(ceilings);
      this.filteredBudgetsSubject.next(transformedData);
    }
  }

  /**
   * ✅ ACTUALIZACIÓN DE GRID OPTIMIZADA
   */
  updateGridData(gridApi: any, data: BudgetItem[]): void {
    if (!gridApi) {
      console.error('❌ GridApi no disponible');
      return;
    }

    console.log('🔄 Actualizando grid con datos:', data.length);

    try {
      gridApi.setGridOption('rowData', data);

      if (data.length === 0) {
        console.warn('⚠️ No hay datos para mostrar en la grid');
      } else {
        console.log('✅ Grid actualizada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al actualizar la grid:', error);
    }
  }

  /**
   * ✅ FILTRADO CON BÚSQUEDA POR ÁREA CORRECTA
   */
  applyFilters(
    searchTerm?: string,
    otherFilters?: any
  ): Observable<BudgetItem[]> {
    return this.filteredBudgets$.pipe(
      map((items) => {
        let filtered = [...items];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.unidad.toLowerCase().includes(term) ||
              item.fuente.toLowerCase().includes(term) ||
              item.capitulo.toLowerCase().includes(term) ||
              item.idTecho.toString().includes(term) ||
              (item.idFinanciero && item.idFinanciero.toString().includes(term))
          );
        }

        return filtered;
      })
    );
  }

  /**
   * ✅ OBTENER ÁREA POR ID (usando id_area_fin)
   */
  getAreaById(areaFinId: number): Area | null {
    return this.administrativeUnitsMap.get(areaFinId) || null;
  }

  /**
   * ✅ OBTENER TODAS LAS ÁREAS
   */
  getAllAreas(): Area[] {
    return Array.from(this.administrativeUnitsMap.values());
  }

  /**
   * ✅ VALIDAR ÁREA FINANCIERA
   */
  validateAreaFinanciera(areaFinId: number): boolean {
    const area = this.administrativeUnitsMap.get(areaFinId);

    if (!area) {
      console.error(`❌ Área financiera ${areaFinId} no es válida`);
      return false;
    }

    console.log(
      `✅ Área financiera ${areaFinId} validada: ${area.nombre_area}`
    );
    return true;
  }

  /**
   * ✅Definiciones de columnas para AG-Grid SIN PORCENTAJE UTILIZADO
   */
  getColumnDefs(): any[] {
    return [
      {
        field: 'idFinanciero',
        headerName: 'ID Info',
        maxWidth: 100,
        cellRenderer: (params: any) => {
          return params.value || 'N/A';
        },
      },
      { field: 'idTecho', headerName: 'ID Techo', hide: true },
      {
        field: 'unidad',
        headerName: 'Área',
        flex: window.innerWidth <= 1024 ? 10 : 2,
        minWidth: window.innerWidth <= 1024 ? 900 : 180,
        cellClass: (params: any) => {
          if (window.innerWidth <= 1024) {
            return 'ag-cell-area-wide';
          }
          return '';
        },
      },
      {
        field: 'capitulo',
        headerName: 'Capítulo',
        flex: window.innerWidth <= 1024 ? 8 : 1,
        minWidth: window.innerWidth <= 1024 ? 700 : 120,
        cellClass: (params: any) => {
          if (window.innerWidth <= 1024) {
            return 'ag-cell-capitulo-wide';
          }
          return '';
        },
      },
      {
        field: 'fuente',
        headerName: 'Financiamiento',
        flex: window.innerWidth <= 1024 ? 6 : 1,
        minWidth: window.innerWidth <= 1024 ? 500 : 120,
        cellClass: (params: any) => {
          if (window.innerWidth <= 1024) {
            return 'ag-cell-financiamiento-wide';
          }
          return '';
        },
      },
      {
        field: 'presupuestado',
        headerName: 'Presupuesto',
        type: 'numericColumn',
        flex: window.innerWidth <= 1024 ? 3 : 1,
        minWidth: window.innerWidth <= 1024 ? 200 : 120,
        cellClass: (params: any) => {
          if (window.innerWidth <= 1024) {
            return 'ag-header-cell-presupuesto-wide';
          }
          return 'text-end font-weight-bold';
        },
        valueFormatter: (params: any) => this.formatCurrency(params.value),
        sort: 'desc',
      },
      {
        field: 'disponible',
        headerName: 'Disponible',
        type: 'numericColumn',
        flex: window.innerWidth <= 1024 ? 2 : 1,
        minWidth: window.innerWidth <= 1024 ? 140 : 120,
        cellClass: (params: any) => {
          if (window.innerWidth <= 1024) {
            return 'ag-header-cell-disponible-wide';
          }
          return 'text-end';
        },
        valueFormatter: (params: any) => this.formatCurrency(params.value),
      },
      ...(() => {
        if (this.hasPermission('Financieros:view_actions')) {
          return [
            {
              headerName: 'Acciones',
              field: 'actions',
              sortable: false,
              filter: false,
              resizable: false,
              flex: 1,
              minWidth: 200,
              cellClass: 'action-cell text-center',
              cellRenderer: (params: any) => {
                const budgetItem = params.data;
                return `
                <div class="d-flex justify-content-center gap-1">
                  <!-- Botón para requisiciones (carrito) -->
                  <button class="btn btn-sm btn-outline-secondary"
                          id="req"
                          title="Asignar Requisiciones"
                          data-action="products"
                          data-id="${budgetItem.idTecho}">
                    <i class="bi bi-cart-plus"></i>
                  </button>
              `;
              },
            },
          ];
        } else {
          return [
            {
              headerName: 'Acciones',
              field: 'actions',
              sortable: false,
              filter: false,
              resizable: false,
              flex: 1,
              minWidth: 200,
              cellClass: 'action-cell text-center',
              cellRenderer: (params: any) => {
                const budgetItem = params.data;
                return `
                <div class="d-flex justify-content-center gap-1">
                  <!-- Botón exportar individual -->
                  <button class="btn btn-sm btn-outline-secondary excel-individual"
                          title="Exportar Individual (Deshabilitado)"
                          data-action="export-individual"
                          data-id="${budgetItem.idTecho}"
                          disabled
                          style="opacity: 0.5; cursor: not-allowed;">
                    <i class="bi bi-file-excel"></i>
                  </button>

                  <!-- Botón exportar detallado -->
                  <button class="btn btn-sm btn-outline-secondary excel-detallado"
                          title="Exportar Detallado (Deshabilitado)"
                          data-action="export-detailed"
                          data-id="${budgetItem.idTecho}"
                          disabled
                          style="opacity: 0.5; cursor: not-allowed;">
                    <i class="bi bi-file-earmark-excel"></i>
                  </button>
                </div>
              `;
              },
            },
          ];
        }
      })(),
    ];
  }

  /**
   * ✅ AÑADIR: Método para cargar áreas (alias para compatibilidad)
   */
  loadAllAreas(): void {
    this.loadAdministrativeUnits().subscribe({
      next: () => console.log('✅ Áreas cargadas correctamente'),
      error: (error) => console.error('❌ Error al cargar áreas:', error),
    });
  }

  /**
   * ✅ AÑADIR: Método para cargar techos (renombrado para compatibilidad)
   */
  loadAllBudgetCeilings(): Observable<any[]> {
    return this.loadBudgetCeilings();
  }

  /**
   * ✅ AÑADIR: Mapeo de techos a datos de tabla (renombrado para compatibilidad)
   */
  mapCeilingsToTableData(ceilings: any[]): BudgetItem[] {
    return this.transformBudgetCeilingsToTableData(ceilings);
  }

  /**
   * ✅ AÑADIR: Exportación a Excel
   */
  exportToExcel(): Observable<Blob> {
    console.log('📊 Iniciando exportación a Excel...');
    this.setLoading(true);

    return this.http
      .get(`${this.apiBaseUrl}/budgetCeiling/export/excel`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: any) => {
          // Extraer nombre del archivo de headers
          let filename = 'Presupuestos.xlsx';
          const contentDisposition = response.headers.get(
            'content-disposition'
          );

          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition
            );
            if (matches?.[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          // Crear blob y descargar automáticamente
          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          // Crear enlace de descarga automático
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();

          // Limpiar URL
          window.URL.revokeObjectURL(url);

          console.log('✅ Exportación completada:', filename);
          return blob;
        }),
        catchError(this.handleError('exportar a Excel')),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * ✅ AÑADIR: Exportación individual a Excel
   */
  exportIndividualToExcel(itemId: number): Observable<Blob> {
    console.log('📊 Exportando item individual:', itemId);
    this.setLoading(true);

    return this.http
      .get(`${this.apiBaseUrl}/budgetCeiling/export/individual/${itemId}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: any) => {
          let filename = `Presupuesto_${itemId}.xlsx`;
          const contentDisposition = response.headers.get(
            'content-disposition'
          );

          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition
            );
            if (matches?.[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);

          return blob;
        }),
        catchError(this.handleError('exportar item individual')),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * ✅ AÑADIR: Exportación detallada a Excel
   */
  exportDetailedToExcel(): Observable<Blob> {
    console.log('📊 Exportando reporte detallado...');
    this.setLoading(true);

    return this.http
      .get(`${this.apiBaseUrl}/budgetCeiling/export/detailed`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: any) => {
          let filename = 'Presupuestos_Detallado.xlsx';
          const contentDisposition = response.headers.get(
            'content-disposition'
          );

          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition
            );
            if (matches?.[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);

          return blob;
        }),
        catchError(this.handleError('exportar reporte detallado')),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * ✅ AÑADIR: Exportación de costeo por artículo a Excel
   */
  exportCosteoArticuloExcel(params?: any): Observable<Blob> {
    console.log('📊 Exportando costeo por artículo...', params);
    this.setLoading(true);

    return this.http
      .post(`${this.apiBaseUrl}/excel/costeo-articulo`, params || {}, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: any) => {
          let filename = 'Costeo_Por_Articulo.xlsx';
          const contentDisposition = response.headers.get(
            'content-disposition'
          );

          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition
            );
            if (matches?.[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);

          console.log('✅ Costeo por artículo exportado:', filename);
          return blob;
        }),
        catchError(this.handleError('exportar costeo por artículo')),
        finalize(() => this.setLoading(false))
      );
  }

  // ✅ MÉTODOS DE GESTIÓN DE ESTADO
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string): void {
    this.errorSubject.next(error);
    if (error) {
      console.error('❌ BudgetsService Error:', error);
    }
  }

  clearError(): void {
    this.errorSubject.next('');
  }

  // ✅ MÉTODOS AUXILIARES
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount || 0);
  }

  /**
   * Manejador genérico de errores para operaciones HTTP
   */
  private handleError(operation: string) {
    return (error: any): Observable<any> => {
      console.error(`❌ Error durante ${operation}:`, error);
      this.setError(`Error al ${operation}`);
      return throwError(() => error);
    };
  }

  /**
   * ✅ MÉTODO DE DEPURACIÓN: Para verificar consistencia de datos con proyectos anuales
   */
  debugDataConsistency(): void {
    console.log('=== DEBUG: CONSISTENCIA DE DATOS CON PROYECTOS ANUALES ===');
    console.log('Áreas en cache:', this.administrativeUnitsMap.size);
    console.log(
      'Techos presupuestales:',
      this.budgetCeilingsSubject.value.length
    );
    console.log('Proyectos anuales:', this.anualProjectsSubject.value.length);
    console.log('Items filtrados:', this.filteredBudgetsSubject.value.length);

    // Verificar relaciones techo-proyecto
    const ceilings = this.budgetCeilingsSubject.value;
    const projects = this.anualProjectsSubject.value;

    const techosConProyecto = ceilings.filter((ceiling) =>
      projects.some((project) => project.dt_techo_id === ceiling.id_techo)
    );

    console.log(
      `Techos con proyecto anual: ${techosConProyecto.length}/${ceilings.length}`
    );

    // Mostrar techos sin proyecto anual
    const techosSinProyecto = ceilings.filter(
      (ceiling) =>
        !projects.some((project) => project.dt_techo_id === ceiling.id_techo)
    );

    if (techosSinProyecto.length > 0) {
      console.warn(
        `⚠️ Techos sin proyecto anual:`,
        techosSinProyecto.map((t) => t.id_techo)
      );
    }

    console.log('=== FIN DEBUG ===');
  }

  destroy(): void {
    this.budgetCeilingsSubject.complete();
    this.filteredBudgetsSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
    this.administrativeUnitsMap.clear();
  }

  /**
   * Obtiene las unidades administrativas disponibles
   */
  getUnidadesAdministrativas(): Observable<{ projects: any[] }> {
    return this.http.get<{ projects: any[] }>(
      `${this.apiBaseUrl}/anualProject`
    );
  }
}
