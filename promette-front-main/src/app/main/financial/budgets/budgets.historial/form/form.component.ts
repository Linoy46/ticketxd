import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BudgetsHistorialService,
  HistorialPresupuesto,
} from '../budgets.historial.service';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridReadyEvent,
  ColDef,
} from 'ag-grid-community';
import {  NgbNavModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { localeText } from '../../../../../core/helpers/localText';
import { environment } from '../../../../../../environments/environment';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';
import { BtnEliminarRendererComponent } from './rendered/btn-eliminar-renderer.component';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    NgbNavModule,
    NgbProgressbarModule,
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @Input() data!: HistorialPresupuesto;
  @Input() requisitionsData: any[] = [];
  @Input() metrics: any = {};
  @Input() resumen: any = {};
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() actualizar: () => void = () => {};
  justificacionesData: any;

  /**
   * Función callback para cerrar el formulario
   * @property {Function} close
   */
  @Input() close: (() => void) = () => {};
  
  // Configuración para la tabla de requisiciones
  private gridApi!: GridApi;
  columnDefs: ColDef[] = [];
  columnDefsJustificaciones: ColDef[] = [
    {
      headerName: 'Partida',
      field: 'ct_partida.clave_partida',
      width: 80,
      filter: 'agNumberColumnFilter',
      sort: 'asc',
    },
    {
      headerName: 'Financiamiento',
      field: 'dt_techo.ct_financiamiento.nombre_financiamiento',
      minWidth: 200,
      flex: 2,
    },
    {
      headerName: 'Justificación',
      field: 'justificacion',
      minWidth: 200,
      flex: 2,
    },
  ];

  // Variables para estadísticas y resumen
  activeTab = 'general';
  totalSolicitado: number = 0;
  requisicionesPorMes: any[] = [];

  // Configuración de la grid
  public paginationPageSize = 10;
  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
    },
    localeText: localeText,
    pagination: true,
    paginationAutoPageSize: true,
  };

  constructor(
    private budgetsHistorial: BudgetsHistorialService,
    private alertService: CoreAlertService,
  ) {}

  ngOnInit(): void {
    this.filtrarJustificaciones(this.data.dt_techo?.ct_area_id || 1);
    // Inicializar columnas para la tabla de requisiciones
    this.initColumnDefs();

    // Procesar datos de requisiciones por mes
    this.procesarRequisicionesPorMes();

    // console.log('Datos del proyecto:', this.data);
    // console.log('Datos de requisiciones:', this.requisitionsData);
    // console.log('Métricas:', this.metrics);
    // console.log('Resumen:', this.resumen);

    this.debugAreaFlow();

    // ✅ CORRECCIÓN: Usar monto_asignado del proyecto anual
    this.totalSolicitado =
      this.resumen?.totalMontoSolicitado || this.data?.monto_asignado || 0;

    console.log('💰 Total solicitado (monto_asignado):', this.totalSolicitado);
  }

  private debugAreaFlow(): void {
    console.log('=== DEBUG FLUJO DIRECTO DESDE GRID ===');
    console.log('1. Resumen desde grid:', this.resumen);
    console.log('2. nombreArea desde resumen:', this.resumen?.nombreArea);
    console.log(
      '3. nombreCapitulo desde resumen:',
      this.resumen?.nombreCapitulo
    );
    console.log(
      '4. nombreFinanciamiento desde resumen:',
      this.resumen?.nombreFinanciamiento
    );
    console.log('5. Datos del proyecto (fallback):', this.data?.dt_techo);
    console.log('6. Información específica del capítulo:', {
      ct_capitulo_id: this.data?.dt_techo?.ct_capitulo_id,
      ct_capitulo: this.data?.dt_techo?.ct_capitulo,
      nombre_capitulo: this.data?.dt_techo?.ct_capitulo?.nombre_capitulo,
      clave_capitulo: this.data?.dt_techo?.ct_capitulo?.clave_capitulo,
    });
    console.log('======================================');
  }

  // ✅ SIMPLIFICADO: Método para obtener el nombre del área
  getAreaName(): string {
    console.log('🎯 getAreaName() llamado - MODO DIRECTO DESDE GRID');

    // ✅ PRIORIDAD 1: Nombre desde el resumen (ya procesado desde la grid)
    const nombreResumen = this.resumen?.nombreArea;
    // console.log('Nombre desde resumen (grid):', nombreResumen);

    if (
      nombreResumen &&
      nombreResumen !== 'Área no disponible' &&
      !nombreResumen.startsWith('Área ID:')
    ) {
      console.log(`✅ Usando nombre desde grid: "${nombreResumen}"`);
      return nombreResumen;
    }

    // ✅ FALLBACK: Procesar directamente desde los datos del proyecto
    return this.processAreaNameFromProject();
  }

  // ✅ SIMPLIFICADO: Método para obtener el nombre del capítulo
  getChapterName(): string {
    console.log('🎯 getChapterName() llamado - MODO DIRECTO DESDE GRID');

    // ✅ PRIORIDAD 1: Nombre desde el resumen (ya procesado desde la grid)
    const nombreCapituloResumen = this.resumen?.nombreCapitulo;
    // console.log('Nombre capítulo desde resumen (grid):', nombreCapituloResumen);

    if (
      nombreCapituloResumen &&
      nombreCapituloResumen !== 'Sin capítulo' &&
      nombreCapituloResumen.trim() !== ''
    ) {
      console.log(
        `✅ Usando nombre capítulo desde grid: "${nombreCapituloResumen}"`
      );
      return nombreCapituloResumen;
    }

    // ✅ FALLBACK: Procesar directamente desde los datos del proyecto
    return this.processChapterNameFromProject();
  }

  // ✅ SIMPLIFICADO: Método para obtener el financiamiento
  getFinancingName(): string {
    console.log('🎯 getFinancingName() llamado - MODO DIRECTO DESDE GRID');

    // ✅ PRIORIDAD 1: Nombre desde el resumen (ya procesado desde la grid)
    const nombreFinanciamientoResumen = this.resumen?.nombreFinanciamiento;
    console.log(
      'Nombre financiamiento desde resumen (grid):',
      nombreFinanciamientoResumen
    );

    if (
      nombreFinanciamientoResumen &&
      nombreFinanciamientoResumen !== 'Sin financiamiento' &&
      nombreFinanciamientoResumen.trim() !== ''
    ) {
      console.log(
        `✅ Usando nombre financiamiento desde grid: "${nombreFinanciamientoResumen}"`
      );
      return nombreFinanciamientoResumen;
    }

    // ✅ FALLBACK: Procesar directamente desde los datos del proyecto
    return this.processFinancingNameFromProject();
  }

  // ✅ NUEVO: Métodos de fallback para procesar desde datos del proyecto
  private processAreaNameFromProject(): string {
    if (this.data?.dt_techo?.rl_area_financiero?.nombre) {
      return this.data.dt_techo.rl_area_financiero.nombre;
    }

    const areaId = this.data?.dt_techo?.ct_area_id;
    if (areaId) {
      return `Área ID: ${areaId}`;
    }

    return 'Área no disponible';
  }

  private processChapterNameFromProject(): string {
    console.log('🔍 Procesando nombre de capítulo desde datos del proyecto...');

    // ✅ PRIORIDAD 1: Nombre completo del capítulo
    if (this.data?.dt_techo?.ct_capitulo?.nombre_capitulo) {
      const nombreCompleto = this.data.dt_techo.ct_capitulo.nombre_capitulo;
      // console.log(`✅ Usando nombre completo: "${nombreCompleto}"`);
      return nombreCompleto;
    }

    // ✅ PRIORIDAD 2: Construir nombre con clave_capitulo
    if (this.data?.dt_techo?.ct_capitulo?.clave_capitulo) {
      const clave = this.data.dt_techo.ct_capitulo.clave_capitulo;
      const nombreConstruido = `Capítulo ${clave}`;
      // console.log(`✅ Usando clave de capítulo: "${nombreConstruido}"`);
      return nombreConstruido;
    }

    // ✅ FALLBACK: Si solo tenemos ct_capitulo_id
    if (this.data?.dt_techo?.ct_capitulo_id) {
      const capituloId = this.data.dt_techo.ct_capitulo_id;
      // console.log(`⚠️ Solo tenemos ct_capitulo_id: ${capituloId}`);
      return `Capítulo ID: ${capituloId}`;
    }

    // console.log('⚠️ No se encontró información de capítulo');
    return 'Sin capítulo';
  }

  private processFinancingNameFromProject(): string {
    if (this.data?.dt_techo?.ct_financiamiento?.nombre_financiamiento) {
      return this.data.dt_techo.ct_financiamiento.nombre_financiamiento;
    }

    return 'Sin financiamiento';
  }

  // Inicialización de las columnas para la tabla de requisiciones
  private initColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'ID',
        field: 'id_requisicion',
        width: 80,
        filter: 'agNumberColumnFilter',
        sort: 'asc',
      },
      {
        headerName: 'Partida',
        field: 'nombrePartida',
        minWidth: 100,
      },
      {
        headerName: 'Producto',
        field: 'nombreProducto',
        minWidth: 200,
        flex: 2,
      },
      {
        headerName: 'Mes',
        field: 'mes',
        minWidth: 120,
        valueFormatter: (params) => this.getMonthName(params.value),
      },
      {
        headerName: 'Cantidad',
        field: 'cantidad',
        minWidth: 100,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => this.formatDecimal(params.value, 3),
      },
      {
        headerName: 'Precio Unitario',
        field: 'precioUnitario',
        minWidth: 140,
        valueFormatter: (params) => this.formatCurrency(params.value),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Total',
        field: 'precioTotal',
        minWidth: 140,
        valueFormatter: (params) => this.formatCurrency(params.value),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Fecha',
        field: 'createdAt',
        minWidth: 130,
        valueFormatter: (params) => this.formatDate(params.value),
      },
      {
        headerName: 'Acciones',
        field: 'id_proyecto_anual',
        sortable: false,
        filter: false,
        minWidth: 120,
        cellClass: 'action-cell',
        cellRenderer: 'btnEliminarRenderer',
        cellRendererParams: {
          onDelete: this.openDeleteDialog.bind(this)
        },
      },
    ];
  }
  frameworkComponents = {
    btnEliminarRenderer: BtnEliminarRendererComponent,
  };
  
    /**
   * Manejar evento de eliminación desde la celda
   */
  handleDeleteReq(e: any): void {
    const reqId = e.detail;
    const req = this.requisitionsData.find((r) => r.id_requisicion === reqId);
    if (req) this.openDeleteDialog(req);
  }

   openDeleteDialog(requision: any): void {
    this.alertService
      .confirm(
        '¿Está seguro que desea eliminar el producto '+requision.data.nombreProducto+'? Esta acción no se puede deshacer.',
        '¿Confirmar eliminación?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          const idReq = requision.data.id_requisicion;
          this.budgetsHistorial.deleteRequisition(idReq).subscribe((response) => {
            if (response.success) {
              this.alertService.success("Producto eliminado exitósamente");
              this.actualizar();
              this.close();
            } 
          });
          //alert(idReq);
          //this.handleDeleteReq(product);
        }
      });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  // Procesamiento de requisiciones agrupadas por mes para gráfica o tabla resumen
  procesarRequisicionesPorMes(): void {
    if (this.resumen && this.resumen.requisitionsByMonth) {
      this.requisicionesPorMes = Object.entries(
        this.resumen.requisitionsByMonth
      )
        .map(([mes, datos]: [string, any]) => {
          return {
            mes,
            solicitado: datos.solicitado,
            montoSolicitado: datos.montoSolicitado,
            count: datos.count,
          };
        })
        .sort((a, b) => {
          // Ordenar meses cronológicamente
          const meses = [
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
          return meses.indexOf(a.mes) - meses.indexOf(b.mes);
        });
    }
  }

  // Helpers para formateo de datos
  formatCurrency(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value || 0);
  }

  formatDecimal(value: number, decimals: number = 3): string {
    if (value === undefined || value === null) return '';
    return value.toLocaleString('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatDateTime(dateString: string): string {
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

  getMonthName(monthNumber: number): string {
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

    // Validar que el número de mes esté en el rango válido (1-12)
    if (monthNumber >= 1 && monthNumber <= 12) {
      return monthNames[monthNumber - 1];
    } else {
      return 'Sin especificar';
    }
  }
  filtrarJustificaciones(id: number | string) {
    let justificaciones: any[] = [];

    this.budgetsHistorial.getJustificaciones().subscribe((response) => {
      const data = response?.justificaciones;

      if (Array.isArray(data)) {
        justificaciones = data.map((item, index) => ({
          ...item,
          index,
        }));

        // Filtra dentro del subscribe, cuando los datos ya existen
        this.justificacionesData = justificaciones.filter(
          (element) => element.ct_area_id == id
        );

        console.log(this.justificacionesData); // ✅ Aquí sí tendrá datos
      }
    });
  }
}
