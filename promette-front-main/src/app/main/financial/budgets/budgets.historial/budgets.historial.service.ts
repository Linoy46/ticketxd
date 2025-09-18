import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, switchMap } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import {
  GridApi,
  ColDef,
  ValueGetterParams,
  ValueFormatterParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { CoreAlertService } from '../../../../core/services/core.alert.service';

// Actualizar interfaz para que coincida con el modelo dt_proyecto_anual del backend
export interface HistorialPresupuesto {
  id_proyecto_anual: number;
  año: number;
  dt_techo_id: number;
  monto_asignado: number;
  monto_utilizado: number;
  monto_disponible: number;
  descripcion?: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
  dt_techo?: {
    id_techo?: number;
    ct_area?: any;
    ct_area_id?: number; // Este campo apunta a rl_area_financiero.id_area_fin
    rl_area_financiero_id?: number;
    ct_capitulo_id?: number;
    ct_financiamiento_id?: number;
    cantidad_presupuestada?: number;
    // La relación correcta es dt_techo.rl_area_financiero (por ct_area_id -> id_area_fin)
    rl_area_financiero?: {
      id_area_fin?: number;
      id_financiero?: number;
      id_area_infra?: number;
      nombre?: string; // Nombre correcto obtenido de la API de infraestructura
      ct_area?: {
        id_area?: number;
        nombre_area?: string;
      };
      ct_financiamiento?: {
        id_financiamiento?: number;
        nombre_financiamiento?: string;
      };
    };
    ct_capitulo?: {
      clave_capitulo: any;
      id_capitulo?: number;
      nombre_capitulo?: string;
    };
    ct_financiamiento?: {
      id_financiamiento?: number;
      nombre_financiamiento?: string;
    };
  };
}

export interface HistorialPresupuestoRequisiciones {
  id_requisicion: number;
  nombreProducto: string;
  descripcionProducto: string;
  fuenteFinanciamiento: string;
  mes: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  solicitadoPor: string;
  createdAt: Date;
  updatedAt: Date;  
}

// Interface para las unidades administrativas desde la API
interface AdministrativeUnit {
  id_area_fin: number;
  id_financiero: number;
  id_area_infra: number;
  nombre: string; // Nombre correcto obtenido de la API de infraestructura
}

@Injectable({
  providedIn: 'root',
})
export class BudgetsHistorialService {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector();
  }

  [x: string]: any;
  private readonly apiBaseUrl = environment.apiUrlPromette;
  private historialData = new BehaviorSubject<HistorialPresupuesto[]>([]);
  historialData$ = this.historialData.asObservable();

  // ✅ NUEVO: Cache para áreas administrativas similar a BudgetsService
  private administrativeUnitsMap = new Map<number, string>();

  constructor(private http: HttpClient, private CoreAlertService: CoreAlertService) {
    console.log(
      '🔗 BudgetsHistorialService inicializado con URL:',
      this.apiBaseUrl
    );
  }

  /**
   * ✅ NUEVO: Carga áreas administrativas usando el mismo endpoint que budgets.component.ts
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
              // ✅ MAPEAR: id_area_fin -> nombre (ya incluye el nombre correcto del endpoint)
              this.administrativeUnitsMap.set(unit.id_area_fin, unit.nombre);
            });
          }

          console.log(
            '✅ Áreas administrativas cargadas en historial:',
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
   * Obtiene los proyectos anuales desde la API
   */
  loadHistorialData(): Observable<HistorialPresupuesto[]> {
    console.log("🚀 Cargando datos históricos desde la API...");

    const fullUrl = `${this.apiBaseUrl}/anualProject`;
    console.log("🌐 URL completa para loadHistorialData:", fullUrl);

    return this.http
      .get<{ success: boolean; projects: HistorialPresupuesto[] }>(fullUrl)
      .pipe(
        switchMap((response) => {
          console.log("✅ Respuesta completa del servidor:", response);
          console.log("📊 Estructura de la respuesta:", {
            success: response.success,
            projectsLength: response.projects?.length || 0,
            hasProjects: !!response.projects,
            projectsType: typeof response.projects
          });
          
          const projects = response.projects || [];
          console.log("📋 Proyectos extraídos:", projects.length);

          if (projects.length === 0) {
            console.warn("⚠️ No se encontraron proyectos en la respuesta");
            this.historialData.next([]);
            return of([]);
          }

          console.log("🔍 Primer proyecto para análisis:", projects[0]);

          return this.loadAdministrativeUnits().pipe(
            map(() => {
              console.log(
                "🗺️ Procesando nombres de área para",
                projects.length,
                "proyectos"
              );

              const processedProjects = projects.map((project, index) => {
                const areaId = project.dt_techo?.ct_area_id;
                console.log(`📋 Proyecto ${index + 1}:`, {
                  id: project.id_proyecto_anual,
                  año: project.año,
                  techo_id: project.dt_techo_id,
                  area_id: areaId,
                  has_dt_techo: !!project.dt_techo
                });

                // Aseguramos que rl_area_financiero está correctamente inicializado
                if (areaId && this.administrativeUnitsMap.has(areaId)) {
                  project.dt_techo = project.dt_techo || {}; // Inicializar dt_techo si no está definido

                  if (project.dt_techo.rl_area_financiero) {
                    project.dt_techo.rl_area_financiero.nombre =
                      this.administrativeUnitsMap.get(areaId);
                  } else {
                    project.dt_techo.rl_area_financiero = {
                      id_area_fin: areaId,
                      nombre: this.administrativeUnitsMap.get(areaId),
                    } as any;
                  }
                }

                return project;
              });

              // Verificar información del usuario
              console.log("👤 Información del usuario:", {
                id_usuario: this.user.id_usuario,
                rl_usuario_puestos: this.user.rl_usuario_puestos?.length || 0,
                puestos: this.user.rl_usuario_puestos?.map((p: any) => p.ct_puesto_id) || []
              });

              // Verificar si el usuario es el 258
              const isUser258 = this.user.id_usuario === 258;

              //Verificar que es el puesto 258
              const isUserPuesto258 = (this.user.rl_usuario_puestos as { ct_puesto_id: number }[]).some(
                (puesto) => puesto.ct_puesto_id === 258
              );

              // Verificar si el usuario tiene el puesto 1806
              const isFinancialHead = (this.user.rl_usuario_puestos as { ct_puesto_id: number }[]).some(
                (puesto) => puesto.ct_puesto_id === 1806
              );

              // Extraer los IDs de área del usuario
              const areaIds = this.user.rl_usuario_puestos
                .map((puesto: any) => puesto.ct_puesto?.ct_area_id)
                .filter((areaId: any) => typeof areaId === "number");

              console.log("🔍 Análisis de filtrado:", {
                isUser258,
                isUserPuesto258,
                isFinancialHead,
                areaIds,
                totalProcessedProjects: processedProjects.length
              });

              // Filtrar proyectos
              let filteredProjects: HistorialPresupuesto[];
              if (isFinancialHead || isUser258) {
                // Si es jefe financiero o usuario 258, ve todos los proyectos
                console.log("🔓 Usuario con acceso completo - Mostrando todos los proyectos");
                filteredProjects = processedProjects;
              } else if(isUserPuesto258){
                // Analista con puesto 258: mostrar todos los proyectos (sin filtro adicional)
                // El backend ya filtra por las áreas asignadas en rl_analista_unidad
                console.log("👤 Analista - Mostrando proyectos filtrados por backend");
                filteredProjects = processedProjects;
              } else {
                // ✅ CORRECCIÓN: Usuario regular - El backend ya filtra correctamente
                // No aplicar filtro adicional en frontend para evitar duplicación
                console.log("👤 Usuario regular - Mostrando proyectos filtrados por backend");
                filteredProjects = processedProjects;
                
                // ✅ DEBUGGING: Verificar que los proyectos corresponden a las áreas del usuario
                console.log("🔍 Verificando correspondencia de áreas:");
                processedProjects.forEach((project) => {
                  const areaFinanciera = project.dt_techo?.ct_area_id;
                  const areaInfra = project.dt_techo?.rl_area_financiero?.id_area_infra;
                  console.log(`  Proyecto ${project.id_proyecto_anual}: área_fin=${areaFinanciera}, área_infra=${areaInfra}`);
                });
              }

              console.log("📊 Resultado final:", {
                totalProcessed: processedProjects.length,
                totalFiltered: filteredProjects.length,
                filtroAplicado: isFinancialHead || isUser258 ? "Acceso completo" : 
                               isUserPuesto258 ? "Analista" : "Usuario regular"
              });

              this.historialData.next(filteredProjects);
              return filteredProjects;
            }),
            catchError((error) => {
              console.error("❌ Error al procesar nombres de área:", error);
              this.historialData.next(projects);
              return of(projects);
            })
          );
        }),
        catchError((error) => {
          console.error("❌ Error al cargar proyectos anuales:", error);
          console.error("❌ URL que falló en loadHistorialData:", fullUrl);
          console.error("❌ Detalles del error:", {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
          return throwError(
            () =>
              new Error(
                "Error al cargar proyectos anuales: " +
                  (error.error?.msg || error.message)
              )
          );
        })
      );
  }

  /**
   * Actualiza los datos en la grid de AG Grid
   */
  updateGridData(gridApi: GridApi, data: HistorialPresupuesto[]): void {
    if (gridApi) {
      try {
        console.log('Actualizando grid con datos:', data);
        gridApi.setGridOption('rowData', data);
      } catch (error) {
        console.error('Error al actualizar la grid:', error);
      }
    }
  }

  /**
   * Aplica filtros al conjunto de datos actual
   */
  applyFilters(
    searchTerm: string,
    filtroEstado?: string,
    filtroAccion?: string
  ): void {
    this.loadHistorialData()
      .pipe(
        map((data) => {
          let filtered = [...data]; // Aplicar filtro de búsqueda
          if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                (item.dt_techo?.rl_area_financiero?.ct_area?.nombre_area
                  ?.toLowerCase()
                  .includes(term) ??
                  false) ||
                (item.descripcion?.toLowerCase().includes(term) ?? false) ||
                item.año?.toString().includes(term)
            );
          }

          // Filtrar por estado (si aplica)
          if (filtroEstado && filtroEstado !== 'todos') {
            const estadoNumerico = filtroEstado === 'activo' ? 1 : 0;
            filtered = filtered.filter(
              (item) => item.estado === estadoNumerico
            );
          }

          return filtered;
        })
      )
      .subscribe((filteredData) => {
        this.historialData.next(filteredData);
      });
  }

  /**
   * Define las columnas para la tabla de AG Grid
   */
  getColumnDefs(): ColDef<HistorialPresupuesto>[] {
    return [
      {
        headerName: 'ID',
        field: 'id_proyecto_anual',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
        minWidth: 80,
      },
      {
        headerName: 'Año',
        field: 'año',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
        minWidth: 80,
      },
      {
        headerName: 'Área',
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1.5,
        valueGetter: (params: ValueGetterParams<HistorialPresupuesto>) => {
          const data = params.data;

          // ✅ SIMPLIFICADO: Usar directamente el nombre procesado
          if (data?.dt_techo?.rl_area_financiero?.nombre) {
            return data.dt_techo.rl_area_financiero.nombre;
          }

          // ✅ FALLBACK: Buscar directamente en el map usando ct_area_id
          const areaId = data?.dt_techo?.ct_area_id;
          if (areaId && this.administrativeUnitsMap.has(areaId)) {
            return this.administrativeUnitsMap.get(areaId);
          }

          // Fallback final
          return areaId ? `Área ID: ${areaId}` : 'Área no disponible';
        },
      },
      {
        headerName: 'Capítulo',
        sortable: true,
        filter: 'agNumberColumnFilter',
        minWidth: 150,
        flex: 1,
        valueGetter: (params: ValueGetterParams<HistorialPresupuesto>) =>
        params.data?.dt_techo?.ct_capitulo?.nombre_capitulo || 'Sin capítulo',
        cellClass: 'text-start',
      },
       {
        headerName: 'Financiamiento',
        sortable: true,
        filter: 'agNumberColumnFilter',
        minWidth: 150,
        flex: 1,
        valueGetter: (params: ValueGetterParams<HistorialPresupuesto>) =>
          params.data?.dt_techo?.ct_financiamiento?.nombre_financiamiento || 'Sin dato',
          cellClass: 'text-start',
      },
      {
        headerName: 'Presupuesto Asignado',
        field: 'monto_asignado',
        sortable: true,
        filter: 'agNumberColumnFilter',
        minWidth: 150,
        flex: 1,
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatCurrency(params.value),
        cellClass: 'text-end',
      },
      {
        headerName: 'Monto Utilizado',
        field: 'monto_utilizado',
        sortable: true,
        filter: 'agNumberColumnFilter',
        minWidth: 150,
        flex: 1,
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatCurrency(params.value),
        cellClass: 'text-end',
      },
      {
        headerName: 'Monto Disponible',
        field: 'monto_disponible',
        sortable: true,
        filter: 'agNumberColumnFilter',
        minWidth: 150,
        flex: 1,
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatCurrency(params.value),
        cellClass: 'text-end',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        filter: true,
        minWidth: 200,
        flex: 2,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        filter: true,
        minWidth: 120,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<HistorialPresupuesto>) =>
          params.value === 1
            ? `<span id="estado" class="badge bg-success">Activo</span>`
            : `<span id="estado" class="badge bg-secondary">Inactivo</span>`,
      },
      {
        headerName: 'Fecha de Creación',
        field: 'createdAt',
        sortable: true,
        filter: 'agDateColumnFilter',
        minWidth: 160,
        flex: 1,
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatDate(params.value),
      },
      {
        headerName: 'Acciones',
        field: 'id_proyecto_anual',
        sortable: false,
        filter: false,
        minWidth: 120,
        cellClass: 'action-cell',
        cellRenderer: (params: ICellRendererParams<HistorialPresupuesto>) => `
          <div class="d-flex justify-content-center">
            <button class="btn btn-sm btn-outline-info me-1 view-detail-btn"
                    data-id="${params.value}"
                    data-action="view"
                    title="Ver detalle"
                    id="ver">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        `,
      },
    ];
  }

  /**
   * Configura los eventos para los botones en la grid
   * @param gridApi API de AG Grid
   * @param onViewClick Función a ejecutar cuando se hace clic en el botón de ver
   * @param onExportClick Función a ejecutar cuando se hace clic en el botón de exportar
   */
  setupGridButtonEvents(
    gridApi: GridApi,
    onViewClick: (id: number) => void,
    onExportClick?: (id: number) => void,
    onExportPdf?:(id:number) =>void
  ): void {
    setTimeout(() => {
      // Selector para los botones de ver detalle
      const viewButtons = document.querySelectorAll('.view-detail-btn');
      viewButtons.forEach((btn) => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const id = parseInt(
            (btn as HTMLElement).getAttribute('data-id') || '0'
          );
          if (id > 0) {
            onViewClick(id);
          }
        });
      });

      // Selector para los botones de exportar
      if (onExportClick) {
        const exportButtons = document.querySelectorAll('.export-btn');
        exportButtons.forEach((btn) => {
          btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const id = parseInt(
              (btn as HTMLElement).getAttribute('data-id') || '0'
            );
            if (id > 0 && onExportClick) {
              onExportClick(id);
            }
          });
        });
      }
      // Botón de exportar a PDF
      if (onExportPdf) {
        const exportPdfButtons = document.querySelectorAll('.export-pdf-btn');
        exportPdfButtons.forEach((btn) => {
          btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const id = parseInt((btn as HTMLElement).getAttribute('data-id') || '0');
            if (id > 0) onExportPdf(id);
          });
        });


      }
    }, 100);
  }

  /**
   * Obtiene un proyecto específico por su ID
   */
  getProjectById(id: number): Observable<HistorialPresupuesto | null> {
    return this.http
      .get<{ success: boolean; project: HistorialPresupuesto }>(
        `${this.apiBaseUrl}/anualProject/${id}`
      )
      .pipe(
        map((response) => {
          if (!response.success || !response.project) {
            return null;
          }

          // Normalizar el objeto de proyecto
          const project = response.project; // Asegurar que dt_techo y sus objetos relacionados tengan una estructura consistente
          if (!project.dt_techo) {
            project.dt_techo = {
              id_techo: project.dt_techo_id,
              rl_area_financiero_id: 0,
            };
          }

          if (
            project.dt_techo &&
            !project.dt_techo.rl_area_financiero &&
            project.dt_techo.rl_area_financiero_id
          ) {
            project.dt_techo.rl_area_financiero = {
              id_area_fin: project.dt_techo.rl_area_financiero_id,
              id_financiero: 0,
              id_area_infra: 0,
              ct_area: {
                id_area: project.dt_techo.rl_area_financiero_id,
                nombre_area: `Área ID: ${project.dt_techo.rl_area_financiero_id}`,
              },
            };
          }

          return project;
        }),
        catchError((error) => {
          console.error(`Error al obtener el proyecto con ID ${id}:`, error);
          return of(null);
        })
      );
  }

  /**
   * ✅ SIMPLIFICADO: Obtiene las requisiciones con nombre correcto del área
   */
  getRequisitionsByProject(projectId: number): Observable<any> {
    if (!projectId) {
      console.error('ID de proyecto no proporcionado');
      return of({
        success: false,
        requisitions: [],
        error: 'ID de proyecto requerido',
      });
    }

    console.log(`🔍 Obteniendo requisiciones para proyecto: ${projectId}`);
    const fullUrl = `${this.apiBaseUrl}/anualProject/${projectId}/requisitions`;
    console.log('🌐 URL completa de la petición:', fullUrl);

    return this.http.get<any>(fullUrl).pipe(
      switchMap((response) => {
        console.log(
          `✅ Respuesta del backend para proyecto ${projectId}:`,
          response
        );

        if (!response || !response.success) {
          return of({
            success: false,
            requisitions: [],
            error:
              response?.msg || 'Error desconocido al obtener requisiciones',
          });
        }

        // ✅ SIMPLIFICADO: Usar ct_area_id directamente para buscar en el map
        const areaId = response.project?.dt_techo?.ct_area_id;

        let nombreArea = 'Área no disponible';
        if (areaId && this.administrativeUnitsMap.has(areaId)) {
          nombreArea = this.administrativeUnitsMap.get(areaId)!;
          console.log(
            `✅ Nombre de área encontrado: "${nombreArea}" para ID ${areaId}`
          );
        } else if (areaId) {
          // Si no está en el map, cargar las unidades administrativas
          return this.loadAdministrativeUnits().pipe(
            map(() => {
              const updatedAreaName =
                this.administrativeUnitsMap.get(areaId) || `Área ID: ${areaId}`;

              return {
                success: true,
                project: response.project,
                requisitions: this.processRequisitionsForDisplay(
                  response.requisitions || []
                ),
                metrics: response.metrics || {},
                resumen: {
                  ...response.totals,
                  nombreArea: updatedAreaName,
                  areaId: areaId,
                  totalMontoSolicitado: response.project?.monto_asignado || 0,
                  nombreCapitulo:
                    response.project?.dt_techo?.ct_capitulo?.nombre_capitulo ||
                    'Sin capítulo',
                  nombreFinanciamiento:
                    response.project?.dt_techo?.ct_financiamiento
                      ?.nombre_financiamiento || 'Sin financiamiento',
                },
              };
            })
          );
        }

        // ✅ DEVOLVER RESPUESTA SIMPLIFICADA
        return of({
          success: true,
          project: response.project,
          requisitions: this.processRequisitionsForDisplay(
            response.requisitions || []
          ),
          metrics: response.metrics || {},
          resumen: {
            ...response.totals,
            nombreArea: nombreArea,
            areaId: areaId,
            totalMontoSolicitado: response.project?.monto_asignado || 0,
            nombreCapitulo:
              response.project?.dt_techo?.ct_capitulo?.nombre_capitulo ||
              'Sin capítulo',
            nombreFinanciamiento:
              response.project?.dt_techo?.ct_financiamiento
                ?.nombre_financiamiento || 'Sin financiamiento',
          },
        });
      }),
      catchError((error) => {
        console.error(
          `❌ Error al obtener requisiciones para proyecto ${projectId}:`,
          error
        );
        console.error('❌ URL que falló:', fullUrl);
        return of({
          success: false,
          requisitions: [],
          error: 'Error al cargar requisiciones',
        });
      })
    );
  }

  /**
   * Actualiza las columnas para la tabla de requisiciones
   */
  getRequisitionsColumnDefs(): ColDef<any>[] {
    return [
      {
        headerName: 'ID',
        field: 'id_requisicion',
        width: 80,
      },
      {
        headerName: 'Producto',
        field: 'nombreProducto',
        minWidth: 180,
        flex: 2,
      },
      {
        headerName: 'Fuente',
        field: 'fuenteFinanciamiento',
        minWidth: 120,
        flex: 1,
        cellRenderer: (params: { value: string | string[] }) => {
          if (Array.isArray(params.value)) {
            return params.value.join(', ');
          }
          return params.value || 'No especificada';
        },
      },
      {
        headerName: 'Mes',
        field: 'mes',
        valueFormatter: (params: ValueFormatterParams) =>
          this.getMonthName(params.value),
        minWidth: 100,
      },
      {
        headerName: 'Solicitado',
        field: 'cantidad',
        type: 'numericColumn',
        headerClass: 'text-end',
        cellClass: 'text-end',
        minWidth: 100,
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatDecimal(params.value, 3),
      },
      {
        headerName: 'Precio Unitario',
        field: 'precioUnitario',
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatCurrency(params.value),
        type: 'numericColumn',
        headerClass: 'text-end',
        cellClass: 'text-end',
        minWidth: 120,
      },
      {
        headerName: 'Precio Total',
        field: 'precioTotal',
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatCurrency(params.value),
        type: 'numericColumn',
        headerClass: 'text-end',
        cellClass: 'text-end',
        minWidth: 120,
      },
      {
        headerName: 'Fecha',
        field: 'createdAt',
        valueFormatter: (params: ValueFormatterParams) =>
          this.formatShortDate(params.value),
        minWidth: 110,
      },
    ];
  }

  getMonthName(value: number | null): string {
    if (!value || value < 1 || value > 12) {
      return 'Sin especificar';
    }

    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return monthNames[value - 1];
  }

  /**
   * Formatea un valor decimal con el número especificado de lugares decimales
   */
  formatDecimal(value: number, decimals: number = 3): string {
    if (value === undefined || value === null) return '';
    return value.toLocaleString('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Procesa las requisiciones para la visualización en la tabla
   * Convierte los datos del backend a un formato amigable para la UI
   */
  private processRequisitionsForDisplay(requisitions: any[]): any[] {
    if (!requisitions || requisitions.length === 0) return [];

    return requisitions.map((req) => {
      const producto = req.ct_producto || {};
      const precioUnitario = producto.precio || 0;
      const cantidad = req.cantidad || 0;
      const precioTotal = parseFloat((precioUnitario * cantidad).toFixed(3));

      return {
        id_requisicion: req.id_producto_requisicion,
        nombreProducto: producto.nombre_producto || 'Producto no disponible',
        nombrePartida: producto.ct_partida.clave_partida || '-',
        descripcionProducto: producto.descripcion || '',
        fuenteFinanciamiento:
          req.dt_techo?.ct_financiamiento?.nombre_financiamiento ||
          'No especificada',
        mes: req.mes,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        precioTotal: precioTotal,
        solicitadoPor:
          req.ct_usuarios_in_ct_usuario?.nombre_usuario || 'No especificado',
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      };
    });
  }

  /**
   * Calcula la sumatoria de los valores de requisiciones
   */
  calculateRequisitionsTotals(requisitions: any[]): {
    totalSolicitado: number;
    totalMontoSolicitado: number;
    requisitionsByMonth: any;
  } {
    // Si no hay datos, devolver valores predeterminados
    if (!requisitions || requisitions.length === 0) {
      return {
        totalSolicitado: 0,
        totalMontoSolicitado: 0,
        requisitionsByMonth: {},
      };
    }

    // Obtener el total de la cantidad solicitada y monto solicitado
    let totalSolicitado = 0;
    let totalMontoSolicitado = 0;

    requisitions.forEach((req) => {
      const cantidadSolicitada = Number(req.cantidad) || 0;
      const precioUnitario = Number(req.precioUnitario) || 0;

      totalSolicitado += cantidadSolicitada;
      totalMontoSolicitado += parseFloat(
        (cantidadSolicitada * precioUnitario).toFixed(3)
      );
    });

    // Redondear los totales a 3 decimales para mantener consistencia
    totalSolicitado = parseFloat(totalSolicitado.toFixed(3));
    totalMontoSolicitado = parseFloat(totalMontoSolicitado.toFixed(3));

    // Agrupar por mes (usando los datos precalculados del backend si están disponibles)
    const requisitionsByMonth = this.processRequisitionsByMonth(requisitions);

    return {
      totalSolicitado,
      totalMontoSolicitado,
      requisitionsByMonth,
    };
  }

  /**
   * Procesa los datos de requisiciones agrupados por mes
   */
  private processRequisitionsByMonth(requisitions: any[]): any {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const requisitionsByMonth: {
      [key: string]: {
        solicitado: number;
        count: number;
        montoSolicitado: number;
      };
    } = {};

    requisitions.forEach((req) => {
      const cantidadSolicitada = Number(req.cantidad) || 0;
      const precioUnitario = Number(req.precioUnitario) || 0;

      // Calcular con precisión de 3 decimales
      const montoSolicitado = parseFloat(
        (cantidadSolicitada * precioUnitario).toFixed(3)
      );

      // Agrupar por mes
      const mesIndex = req.mes ? req.mes - 1 : -1;
      const mesNombre =
        mesIndex >= 0 && mesIndex < 12 ? monthNames[mesIndex] : 'Sin mes';

      if (!requisitionsByMonth[mesNombre]) {
        requisitionsByMonth[mesNombre] = {
          solicitado: 0,
          count: 0,
          montoSolicitado: 0,
        };
      }

      requisitionsByMonth[mesNombre].solicitado += cantidadSolicitada;
      requisitionsByMonth[mesNombre].montoSolicitado += montoSolicitado;
      requisitionsByMonth[mesNombre].count++;
    });

    // Redondear los valores finales a 3 decimales para todas las entradas
    for (const month in requisitionsByMonth) {
      requisitionsByMonth[month].solicitado = parseFloat(
        requisitionsByMonth[month].solicitado.toFixed(3)
      );
      requisitionsByMonth[month].montoSolicitado = parseFloat(
        requisitionsByMonth[month].montoSolicitado.toFixed(3)
      );
    }

    return requisitionsByMonth;
  }

  /**
   * Formatea un valor monetario para mostrar
   */
  formatCurrency(amount: number): string {
    // Asegurar que se muestren exactamente 3 decimales, independientemente de si son ceros o no
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount || 0);
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Formatea una fecha para mostrar en formato corto (sin hora)
   */
  formatShortDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Capitaliza la primera letra de una cadena
   */
  private capitalizeFirstLetter(string: string): string {
    return string?.charAt(0).toUpperCase() + string?.slice(1) || '';
  }

  public getJustificaciones(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/justificacion`);
  }
  public deleteRequisition(id:number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/requisition/${id}`);
  }

  //projectId: number
  descargarPdf(projectId: number,area:string,curp:string): Observable<Blob> {
    return this.http.post(`${this.apiBaseUrl}/pdf/requisicion-compra`,{projectId,area,curp}, {
      responseType: 'blob'
    }).pipe(
        catchError(error => {
        this.CoreAlertService.error('Error al obtener el PDF del informe');
        return of(new Blob());
        })
      );
  }
}
