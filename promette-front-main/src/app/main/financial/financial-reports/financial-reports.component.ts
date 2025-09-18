import { CoreAlertService } from './../../../core/services/core.alert.service';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { BehaviorSubject, Subject, takeUntil, take } from 'rxjs';
import { ReporstService } from './services/reporst.service';
import { PUESTOS_FINANCIEROS_DICTIONARY } from '../financial.constants';
import { AdministrativeService } from '../administrative.units/services/administrative.service';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PuestoFilterPipe } from './puesto-filter.pipe';
import { id } from '@swimlane/ngx-datatable';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-financial-reports',
  imports: [
    CommonModule,
    AgGridAngular,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    PuestoFilterPipe, // Pipe personalizado para filtrar puestos
  ],
  templateUrl: './financial-reports.component.html',
  styleUrl: './financial-reports.component.scss',
})
export class FinancialReportsComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;

  //Obtencion del usuario por redux
  private userSelector = injectSelector<RootState, any>((state) => state.auth);
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  //CONSTANTE DE PUESTOS
  private puestosArray = PUESTOS_FINANCIEROS_DICTIONARY;

  public puedeVerSelectArea: boolean = false;
  public esAdmin: boolean = false;

  // Variables de estado de carga para los botones
  public isLoadingDesglose: boolean = false;
  public isLoadingCosteo: boolean = false;
  public isLoadingFormatoGeneral: boolean = false;

  // Getter para el estado de carga general
  get isLoading(): boolean {
    return (
      this.isLoadingDesglose ||
      this.isLoadingCosteo ||
      this.isLoadingFormatoGeneral
    );
  }

  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  private analysts: any[] = [];
  //private userAreasFin: number[] = [];

  // --- Autocompletado de puestos financieros ---
  puestoControl = new FormControl('');
  filteredPuestos: { label: string; value: number }[] = [];
  areasAdministrativasSeleccionadas: string[] = [];

  // --- Fin autocompletado ---

  puestoSeleccionado: number | null = null;
  filtroPuesto: string = '';
  areaSeleccionada: { nombre: string; id_area_fin: number } | null = null;
  areasAdministrativas: { nombre: string; id_area_fin: number }[] = [];

  constructor(
    private reporstService: ReporstService,
    private CoreAlertService: CoreAlertService,
    private adminService: AdministrativeService
  ) {
    //console.log(`PUESTO ADMIN: ${this.puestosArray.Admin} PUESTO ANALISTA: ${this.puestosArray.Analista}`)
    //console.log(`PUESTOS ${JSON.stringify(this.puestosArray)}`);

    effect(() => {
      const userData = this.userSelector();
      if (userData) {
        this.currentUserSubject.next(userData);
        console.log(userData.user);
      } else {
        console.log('usuario aún no disponible');
      }
    });
  }

  // Tema personalizado para AG Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
    },
    animateRows: true,
    components: { actionsCellRenderer: SharedActionsGridComponent },
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50],
  };

  // Definición de columnas
  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 70,
      maxWidth: 80,
      width: 80,
    },
    {
      field: 'nombre_reporte',
      headerName: 'Nombre del Reporte',
      minWidth: 120,
      maxWidth: 150,
      width: 150,
      flex: 1,
    },
    {
      headerName: 'Acciones',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onReporte: (rowData: any) => {
          if (rowData) {
            console.log('Datos de la fila:', rowData);
            this.report(rowData);
          } else {
            console.error('No se pudo obtener los datos de la fila');
          }
        },
      },
      minWidth: 70,
      maxWidth: 80,
      width: 80,
    },
  ];

  // Datos de ejemplo actualizados y convertidos a mayúsculas
  rowData = [
    {
      id: 1,
      nombre_reporte: 'DESGLOSE DE CONCEPTO POR PARTIDA (FONE)',
      financiamiento: 1,
    },
    {
      id: 2,
      nombre_reporte: 'DESGLOSE DE CONCEPTO POR PARTIDA (MAC)',
      financiamiento: 2,
    },
    {
      id: 3,
      nombre_reporte: 'DESGLOSE DE CONCEPTO POR PARTIDA (RECURSO ESTATAL)',
      financiamiento: 3,
    },
    {
      id: 4,
      nombre_reporte: 'FORMATO DE COSTEO POR ARTICULO (FONE)',
      financiamiento: 1,
    },
    {
      id: 5,
      nombre_reporte: 'FORMATO DE COSTEO POR ARTICULO (MAC)',
      financiamiento: 2,
    },
    {
      id: 6,
      nombre_reporte: 'FORMATO DE COSTEO POR ARTICULO (RECURSO ESTATAL)',
      financiamiento: 3,
    },
    //{ id: 7, nombre_report: 'DESGLOSE DE CONCEPTO POR PARTIDA CONCENTRADO', financiamiento: 0 },
    //{ id: 8, nombre_report: 'FORMATO DE COSTEO POR ARTICULO CONCENTRADO', financiamiento: 0 },
    //{ id: 5, nombre_reporte: 'REPORTE PRESUPUESTAL (FONE)', financiamiento: 1 },
    //{ id: 6, nombre_reporte: 'REPORTE PRESUPUESTAL (MAC)', financiamiento: 2 },
    //{ id: 7, nombre_reporte: 'REPORTE PRESUPUESTAL (RECURSO ESTATAL)', financiamiento: 3 },
    //{ id: 8, nombre_reporte: 'DESGLOSE DE JUSTIFICACION POR PARTIDA', financiamiento: 3 },
    //{ id: 9, nombre_reporte: 'FORMATO PDF DE REQUISICION MENSUAL (IMPRESION DEL MES A CORRIENTE)', financiamiento: 0 }
  ];

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  ngOnInit(): void {
    this.loadAdministrativeUnitsForSelect();
    this.initAutocompletePuestos();

    this.currentUser$.subscribe((userData) => {
      console.log('1. Datos del usuario recibidos:', userData);
      if (userData && userData.user) {
        console.log('2. Objeto de usuario:', userData.user);
        const puestos = userData.user.rl_usuario_puestos || [];
        console.log('3. Puestos del usuario:', puestos);

        const tienePuestoRequerido = puestos.some(
          (p: any) =>
            p.ct_puesto_id === this.puestosArray.Admin ||
            p.ct_puesto_id === this.puestosArray.Analista
        );

        console.log(
          '4. ¿Tiene puesto requerido? (Admin: 1806, Analista: 258):',
          tienePuestoRequerido
        );

        this.puedeVerSelectArea = tienePuestoRequerido;
        console.log(
          '5. Valor final de puedeVerSelectArea:',
          this.puedeVerSelectArea
        );

        this.esAdmin = puestos.some((p: any) => p.ct_puesto_id === 1806);
        console.log('6. ¿Es Admin?:', this.esAdmin);
      } else {
        console.log('Error: No se encontró userData o userData.user');
      }
    });

    if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col) => ({
          ...col,
          minWidth: 120,
          flex: 1,
        }));
      }
    }
  }

  // Inicializar opciones de autocompletado
  initAutocompletePuestos() {
    // Convertir el diccionario a array de opciones
    this.filteredPuestos = Object.entries(this.puestosArray).map(
      ([label, value]) => ({ label, value })
    );
    // Opcional: puedes ordenar por label si lo deseas
    // this.filteredPuestos.sort((a, b) => a.label.localeCompare(b.label));
  }

  // Evento cuando se selecciona un puesto
  onPuestoSelected(puestoId: number) {
    this.areasAdministrativasSeleccionadas = [];
    this.adminService.getAdministrativeUnitsByPuesto(puestoId).subscribe({
      next: (response: any) => {
        this.areasAdministrativasSeleccionadas =
          response.areas?.map((a: any) => a.nombre_area) || [];
      },
      error: (error: any) => {
        this.areasAdministrativasSeleccionadas = [];
      },
    });
  }

  // Método que se ejecuta cuando el componente se destruye
  ngOnDestroy(): void {
    this.destroy$.next(); // Emite un valor para cancelar todas las suscripciones
    this.destroy$.complete(); // Completa el Subject
  }

  administrativeUnits: any[] = [];
  analystUnit: any[] = [];
  UnitByAreaId?: number;

  // Método para cargar las unidades administrativas
  loadAdministrativeUnits() {
    this.adminService
      .getAdministrativeUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.administrativeUnits) {
            // Cargar todas las unidades administrativas
            this.administrativeUnits = response.administrativeUnits.map(
              (unit: any) => unit.id_area_fin
            );
            // console.log('Unidades administrativas cargadas:', this.administrativeUnits);
          }
        },
        error: (error) => {
          console.error('Error al cargar las unidades administrativas:', error);
          //this.CoreAlertService.error('Error al cargar las unidades administrativas');
        },
      });
  }
  // Método para cargar los analistas
  loadAnalysts(ctUsuarioId: number) {
    this.adminService
      .getAnalysts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Filtrar los analistas que corresponden al usuario activo
          this.analysts =
            response.analysts.filter(
              (analyst: any) => analyst.ct_usuario_id === ctUsuarioId
            ) || [];

          // Extraer las id_area_fin correspondientes al usuario activo
          this.analystUnit = this.analysts.map(
            (analyst: any) =>
              analyst.rl_area_financiero_rl_area_financiero?.id_area_fin
          );

          //console.log('Áreas financieras del usuario:',  this.analystUnit);
        },
        error: (error) => {
          console.error('Error al cargar los analistas:', error);
        },
      });
  }

  // Método para obtener el último valor de results
  getBudgetAreaByInfra(ct_area_id: number) {
    this.reporstService
      .getLastBudgetAreaByInfra(ct_area_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            //console.log('Último valor de results:', response);
            this.UnitByAreaId = response.id_area_fin;
            console.log('Valor del UnitByAreaId', this.UnitByAreaId);
          } else {
            //console.log('No se encontraron resultados');
          }
        },
        error: (error) => {
          console.error(
            'Error al obtener el área financiera por infraestructura:',
            error
          );
          this.CoreAlertService.error(
            'Error al obtener el área financiera por infraestructura'
          );
        },
      });
  }

  // Método para encontrar el analista asignado a una unidad administrativa
  /* findAnalistaForUnit(idAreaFin: number): any {
     if (!this.analysts || this.analysts.length === 0) return null;
 
     // Buscar analista por el id de la unidad administrativa
     return this.analysts.find(
       (analyst: any) =>
         analyst.rl_area_financiero_rl_area_financiero?.id_area_fin === idAreaFin) || null;
   }*/

  // Función para descargar Excel
  report(rowData: any): void {
    const reportName = rowData.nombre_reporte;
    this.currentUser$.pipe(take(1)).subscribe((userData) => {
      if (userData && userData.user) {
        // Obtener idAreaFin como un array de administrativeUnits
        let idAreaFin =
          userData.user.rl_usuario_puestos[0].ct_puesto.ct_area_id;
        let idUsuario = userData.user.id_usuario;
        let idFinanciamiento = rowData.financiamiento;
        let ctPuestoId = userData.user.rl_usuario_puestos[0].ct_puesto_id;

        // NUEVO: Si hay un área seleccionada en el select, usarla y priorizarla
        if (this.areaSeleccionada) {
          idAreaFin = this.areaSeleccionada.id_area_fin;
          console.log(
            `Área seleccionada por el usuario (select): ${idAreaFin}`
          );
        } else {
          console.log(`AREAS ANTES DELA CONDICIONAL: ${idAreaFin}`);

          //condicional para la asignacion de unidades segun el perfil del usuario activo.
          if (ctPuestoId == this.puestosArray.Admin) {
            this.loadAdministrativeUnits();
            idAreaFin = this.administrativeUnits;
            console.log(`Areas de administrativo ${idAreaFin}`);
          } else if (ctPuestoId == this.puestosArray.Analista) {
            this.loadAnalysts(idUsuario);
            idAreaFin = this.analystUnit;
            console.log(`Areas de analista ${idAreaFin}`);
          } else {
            this.getBudgetAreaByInfra(idAreaFin);
            idAreaFin = this.UnitByAreaId;
            console.log(`Area especifica del usuario ${idAreaFin}`);
          }
        }

        console.log(`DESPUES DE LA CONDICIONAL: ${idAreaFin}`);

        // VALIDACIÓN CRÍTICA: Verificar que se tenga un área válida
        if (
          !idAreaFin ||
          (Array.isArray(idAreaFin) && idAreaFin.length === 0) ||
          idAreaFin === undefined ||
          idAreaFin === null
        ) {
          this.CoreAlertService.error(
            'Sucedió un error inesperado. Vuelve a presionar el botón.',
            'Error de Área'
          );
          console.error(
            'Error: No se pudo obtener un área válida para el usuario'
          );
          return;
        }

        // Verificar si el reporte es uno de los que usa el método generalCosting
        const reportesCosteo = [
          'FORMATO DE COSTEO POR ARTICULO (FONE)',
          'FORMATO DE COSTEO POR ARTICULO (MAC)',
          'FORMATO DE COSTEO POR ARTICULO (RECURSO ESTATAL)',
        ];

        // Verificar si el reporte es uno de los que usa el método techosPresupuestales
        const reportesTechosPresupuestales = [
          'DESGLOSE DE CONCEPTO POR PARTIDA (FONE)',
          'DESGLOSE DE CONCEPTO POR PARTIDA (MAC)',
          'DESGLOSE DE CONCEPTO POR PARTIDA (RECURSO ESTATAL)',
        ];

        // Verificar si el reporte es uno de los que usa el método anteproyectos
        const reportesAnteproyectos = [
          'REPORTE PRESUPUESTAL (FONE)',
          'REPORTE PRESUPUESTAL (MAC)',
          'REPORTE PRESUPUESTAL (RECURSO ESTATAL)',
        ];

        // Verificar si el reporte es uno de los que usa el método requisicionMensual
        const reporteRequisicionMensual = [
          'FORMATO PDF DE REQUISICION MENSUAL (IMPRESION DEL MES A CORRIENTE)',
        ];

        // Verificar si el reporte es uno de los que usa el método justificacion por partida
        const reportesJustificacionPartida = [
          'DESGLOSE DE JUSTIFICACION POR PARTIDA',
          // Agrega aquí si hay más reportes que usen justificación
        ];
        // Nuevo: Reporte de desglose de concepto por partida
        const reportesDesglosePartida = [
          'DESGLOSE DE CONCEPTO POR PARTIDA (FONE)',
          'DESGLOSE DE CONCEPTO POR PARTIDA (MAC)',
          'DESGLOSE DE CONCEPTO POR PARTIDA (RECURSO ESTATAL)',
        ];

        if (reportesCosteo.includes(reportName)) {
          // Llamar al método generalCosting del servicio con el array de idAreaFin
          this.reporstService
            .generalCosting(idAreaFin, idFinanciamiento, idUsuario)
            .subscribe((blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error('Archivo vacío');
                return;
              }
              // Validar si recibimos JSON en vez de Excel
              if (blob.type && blob.type.indexOf('application/json') !== -1) {
                blob.text().then((text) => {
                  try {
                    const errorJson = JSON.parse(text);
                    // Verificar si es un error de información no disponible
                    if (
                      errorJson.msg &&
                      (errorJson.msg.includes(
                        'No hay presupuestos disponibles'
                      ) ||
                        errorJson.msg.includes(
                          'No se proporcionaron áreas financieras'
                        ) ||
                        errorJson.msg.includes('No se encontró el área'))
                    ) {
                      this.CoreAlertService.error(
                        'Este financiamiento no tiene información'
                      );
                    } else {
                      const msg =
                        errorJson.msg ||
                        'Error desconocido al descargar el archivo Excel de costeos por producto';
                      this.CoreAlertService.error(msg);
                    }
                  } catch {
                    this.CoreAlertService.error(
                      'Sucedió un error inesperado. Vuelve a presionar el botón.'
                    );
                  }
                });
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            });
        }
        // --- MODIFICACIÓN PARA DESGLOSE DE PARTIDA ---
        if (reportesDesglosePartida.includes(reportName)) {
          // Validar que el financiamiento sea válido
          if (
            !idFinanciamiento ||
            (idFinanciamiento !== 1 &&
              idFinanciamiento !== 2 &&
              idFinanciamiento !== 3)
          ) {
            this.CoreAlertService.error(
              'Tipo de financiamiento no válido. Debe ser FONE (1), MAC (2) o RECURSO ESTATAL (3).',
              'Parámetro Inválido'
            );
            return;
          }

          const idAreasArray = Array.isArray(idAreaFin)
            ? idAreaFin
            : [idAreaFin];
          const body = {
            ct_area_id: idAreasArray,
            ct_puesto_id: ctPuestoId,
            ct_financiamiento_id: idFinanciamiento,
            nombre_usuario: userData.user.nombre_usuario,
          };

          // Logs de verificación para debugging
          console.log('=== DESGLOSE DE PARTIDA ===');
          console.log('Reporte:', reportName);
          console.log('Financiamiento ID:', idFinanciamiento);
          console.log(
            'Tipo de financiamiento:',
            idFinanciamiento === 1
              ? 'FONE'
              : idFinanciamiento === 2
              ? 'MAC'
              : idFinanciamiento === 3
              ? 'RECURSO ESTATAL'
              : 'DESCONOCIDO'
          );
          console.log('Áreas:', idAreasArray);
          console.log('Puesto ID:', ctPuestoId);
          console.log('Body completo:', body);

          // Mensaje informativo para el usuario
          const tipoFinanciamiento =
            idFinanciamiento === 1
              ? 'FONE'
              : idFinanciamiento === 2
              ? 'MAC'
              : idFinanciamiento === 3
              ? 'RECURSO ESTATAL'
              : 'DESCONOCIDO';

          console.log(
            `Generando reporte de desglose por partida para financiamiento: ${tipoFinanciamiento}`
          );

          fetch(`${environment.apiUrlPromette}/excel/desglose-partida`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
            .then(async (response) => {
              // Si la respuesta es JSON, puede ser un error
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const json = await response.json();
                if (
                  json &&
                  (json.msg ===
                    'No hay presupuestos disponibles para el área del usuario.' ||
                    json.msg === 'No se proporcionaron áreas financieras' ||
                    json.msg === 'No se encontró el área del usuario.')
                ) {
                  this.CoreAlertService.error(
                    'Este financiamiento no tiene información'
                  );
                  throw new Error(json.msg);
                } else if (json && json.msg) {
                  this.CoreAlertService.error(json.msg);
                  throw new Error(json.msg);
                }
              }
              if (!response.ok)
                throw new Error('No se pudo descargar el archivo');
              return response.blob();
            })
            .then((blob) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error('Archivo vacío');
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            })
            .catch((error) => {
              if (
                error.message &&
                (error.message ===
                  'No hay presupuestos disponibles para el área del usuario.' ||
                  error.message === 'No se proporcionaron áreas financieras' ||
                  error.message === 'No se encontró el área del usuario.')
              ) {
                // Ya se mostró el SweetAlert
                return;
              }
              this.CoreAlertService.error(
                'Error al descargar el archivo: ' + error.message
              );
            });
          return;
        }
        // --- FIN MODIFICACIÓN ---
        else if (reportesTechosPresupuestales.includes(reportName)) {
          // Validar que el financiamiento sea válido
          if (
            !idFinanciamiento ||
            (idFinanciamiento !== 1 &&
              idFinanciamiento !== 2 &&
              idFinanciamiento !== 3)
          ) {
            this.CoreAlertService.error(
              'Tipo de financiamiento no válido. Debe ser FONE (1), MAC (2) o RECURSO ESTATAL (3).',
              'Parámetro Inválido'
            );
            return;
          }

          // Llamar al endpoint de desglose-partida usando la variable de entorno
          const idAreasArray = Array.isArray(idAreaFin)
            ? idAreaFin
            : [idAreaFin];
          const body = {
            ct_area_id: idAreasArray,
            ct_puesto_id: ctPuestoId,
            ct_financiamiento_id: idFinanciamiento,
            nombre_usuario: userData.user.nombre_usuario,
          };

          // Logs de verificación para debugging
          console.log('=== TECHOS PRESUPUESTALES ===');
          console.log('Reporte:', reportName);
          console.log('Financiamiento ID:', idFinanciamiento);
          console.log(
            'Tipo de financiamiento:',
            idFinanciamiento === 1
              ? 'FONE'
              : idFinanciamiento === 2
              ? 'MAC'
              : idFinanciamiento === 3
              ? 'RECURSO ESTATAL'
              : 'DESCONOCIDO'
          );
          console.log('Áreas:', idAreasArray);
          console.log('Puesto ID:', ctPuestoId);
          console.log('Body completo:', body);

          // Mensaje informativo para el usuario
          const tipoFinanciamiento =
            idFinanciamiento === 1
              ? 'FONE'
              : idFinanciamiento === 2
              ? 'MAC'
              : idFinanciamiento === 3
              ? 'RECURSO ESTATAL'
              : 'DESCONOCIDO';

          console.log(
            `Generando reporte de techos presupuestales para financiamiento: ${tipoFinanciamiento}`
          );

          fetch(`${environment.apiUrlPromette}/excel/desglose-partida`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
            .then(async (response) => {
              // Si la respuesta es JSON, puede ser un error
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const json = await response.json();
                if (
                  json &&
                  (json.msg ===
                    'No hay presupuestos disponibles para el área del usuario.' ||
                    json.msg === 'No se proporcionaron áreas financieras' ||
                    json.msg === 'No se encontró el área del usuario.')
                ) {
                  this.CoreAlertService.error(
                    'Este financiamiento no tiene información'
                  );
                  throw new Error(json.msg);
                } else if (json && json.msg) {
                  this.CoreAlertService.error(json.msg);
                  throw new Error(json.msg);
                }
              }
              if (!response.ok)
                throw new Error('No se pudo descargar el archivo');
              return response.blob();
            })
            .then((blob) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error('Archivo vacío');
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            })
            .catch((error) => {
              if (
                error.message &&
                (error.message ===
                  'No hay presupuestos disponibles para el área del usuario.' ||
                  error.message === 'No se proporcionaron áreas financieras' ||
                  error.message === 'No se encontró el área del usuario.')
              ) {
                // Ya se mostró el SweetAlert
                return;
              }
              this.CoreAlertService.error(
                'Error al descargar el archivo: ' + error.message
              );
            });
        } else if (reportesAnteproyectos.includes(reportName)) {
          // Llamar al método anteproyectos del servicio con el array de idAreaFin
          this.reporstService
            .anteproyectos(idAreaFin, ctPuestoId, idFinanciamiento)
            .subscribe((blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error('Archivo vacío');
                return;
              }
              // Validar si recibimos JSON en vez de Excel
              if (blob.type && blob.type.indexOf('application/json') !== -1) {
                blob.text().then((text) => {
                  try {
                    const errorJson = JSON.parse(text);
                    const msg =
                      errorJson.msg ||
                      'Error desconocido al descargar el archivo Excel de anteproyectos';
                    this.CoreAlertService.error(msg);
                  } catch {
                    this.CoreAlertService.error(
                      'Ocurrió un error inesperado al procesar la respuesta del servidor'
                    );
                  }
                });
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            });
        } else if (reporteRequisicionMensual.includes(reportName)) {
          // Llamar al método requisicionMensual del servicio con el array de idAreaFin
          this.reporstService
            .requisicionMensual(idAreaFin, idUsuario)
            .subscribe((blob: Blob | null) => {
              // Tratar de leer el blob como texto para detectar JSON de error, aunque el Content-Type sea incorrecto
              blob?.text().then((text) => {
                try {
                  const errorJson = JSON.parse(text);
                  const msg =
                    errorJson.msg ||
                    'Error desconocido al descargar el archivo PDF de requisición mensual';
                  this.CoreAlertService.error(msg);
                  return; // NO intentes descargar el archivo
                } catch {
                  // No es JSON, entonces sí es archivo válido
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${reportName}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }
              });
            });
        } else if (reportesJustificacionPartida.includes(reportName)) {
          // Enviar los parámetros requeridos por POST
          const body = {
            ct_area_id: idAreaFin,
            ct_puesto_id: ctPuestoId,
            ct_financiamiento_id: idFinanciamiento,
          };
          fetch(`${environment.apiUrlPromette}/excel/justificacion-partida`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
            .then((response) => {
              if (!response.ok)
                throw new Error('No se pudo descargar el archivo');
              return response.blob();
            })
            .then((blob) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error('Archivo vacío');
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            })
            .catch((error) => {
              this.CoreAlertService.error(
                'Error al descargar el archivo: ' + error.message
              );
            });
        } else {
          console.log('Este reporte no tiene un método asociado');
        }
      } else {
        console.log('No se pudo obtener la información del usuario');
      }
    });
  }

  // Cargar áreas administrativas desde el endpoint y solo mostrar el nombre
  loadAdministrativeUnitsForSelect() {
    this.adminService.getAdministrativeUnits().subscribe({
      next: (response: any) => {
        // Guardar objetos completos con nombre e id_area_fin
        this.areasAdministrativas = (response.administrativeUnits || []).map(
          (unit: any) => ({
            nombre: unit.nombre_area || unit.nombre,
            id_area_fin: unit.id_area_fin,
          })
        );
      },
      error: () => {
        this.areasAdministrativas = [];
      },
    });
  }

  // Método para descargar el consolidado de desglose por partida
  descargarConsolidadoDesglose(): void {
    this.isLoadingDesglose = true;

    this.currentUser$.pipe(take(1)).subscribe((userData) => {
      if (!userData || !userData.user) {
        this.CoreAlertService.error(
          'No se pudo obtener la información del usuario.'
        );
        this.isLoadingDesglose = false;
        return;
      }

      // VALIDACIÓN: Verificar que se tenga un área válida
      if (
        this.areaSeleccionada &&
        (!this.areaSeleccionada.id_area_fin ||
          this.areaSeleccionada.id_area_fin === null ||
          this.areaSeleccionada.id_area_fin === undefined)
      ) {
        this.CoreAlertService.error(
          'Sucedió un error inesperado. Vuelve a presionar el botón.',
          'Error de Área'
        );
        this.isLoadingDesglose = false;
        return;
      }

      if (this.areaSeleccionada) {
        // Si hay área seleccionada, enviar los parámetros normales
        let idAreas = [this.areaSeleccionada.id_area_fin];
        let ctPuestoId = userData.user.rl_usuario_puestos[0].ct_puesto_id;
        let idFinanciamiento = this.rowData[0]?.financiamiento || 1;

        this.reporstService
          .desglosePartidaConsolidado(
            idAreas,
            ctPuestoId,
            idFinanciamiento as any
          )
          .subscribe({
            next: (blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error(
                  'El archivo generado está vacío. Verifique que existan datos en el sistema.',
                  'Archivo Vacío'
                );
                this.isLoadingDesglose = false;
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Consolidado_Desglose_Partida.xlsx';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.isLoadingDesglose = false;
              this.CoreAlertService.success(
                'Reporte de desglose por partida generado y descargado exitosamente.',
                '¡Reporte Completado!'
              );
            },
            error: (error) => {
              console.error('Error al generar reporte de desglose:', error);
              this.CoreAlertService.error(
                'Error de conexión al generar el reporte consolidado. Verifique su conexión a internet y vuelva a intentar.',
                'Error de Conexión'
              );
              this.isLoadingDesglose = false;
            },
          });
      } else {
        // Si no hay área seleccionada, NO enviar ningún parámetro (consolidado global)
        this.reporstService
          .desglosePartidaConsolidado(
            undefined as any,
            undefined as any,
            undefined as any
          )
          .subscribe({
            next: (blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error(
                  'Archivo vacío o error al generar el consolidado de desglose por partida.'
                );
                this.isLoadingDesglose = false;
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Consolidado_Desglose_Partida.xlsx';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.isLoadingDesglose = false;
              this.CoreAlertService.success(
                'Reporte consolidado de desglose por partida generado y descargado exitosamente.',
                '¡Reporte Completado!'
              );
            },
            error: (error) => {
              this.CoreAlertService.error(
                'Error al generar el consolidado de desglose por partida. Por favor, intente nuevamente.'
              );
              this.isLoadingDesglose = false;
            },
          });
      }
    });
  }

  // Método para descargar el consolidado de costeo por producto
  descargarConsolidadoFormatoPorProducto(): void {
    this.isLoadingCosteo = true;

    this.currentUser$.pipe(take(1)).subscribe((userData) => {
      if (!userData || !userData.user) {
        this.CoreAlertService.error(
          'No se pudo obtener la información del usuario.'
        );
        this.isLoadingCosteo = false;
        return;
      }

      // VALIDACIÓN: Verificar que se tenga un área válida
      if (
        this.areaSeleccionada &&
        (!this.areaSeleccionada.id_area_fin ||
          this.areaSeleccionada.id_area_fin === null ||
          this.areaSeleccionada.id_area_fin === undefined)
      ) {
        this.CoreAlertService.error(
          'Sucedió un error inesperado. Vuelve a presionar el botón.',
          'Error de Área'
        );
        this.isLoadingCosteo = false;
        return;
      }

      if (this.areaSeleccionada) {
        // Si hay área seleccionada, enviar los parámetros normales
        let idAreas = [this.areaSeleccionada.id_area_fin];
        let idUsuario = userData.user.id_usuario;
        let idFinanciamiento = this.rowData[0]?.financiamiento || 1;

        this.reporstService
          .costeoProductoConsolidado(
            idAreas,
            idFinanciamiento as any,
            idUsuario
          )
          .subscribe({
            next: (blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error(
                  'Este financiamiento no tiene información'
                );
                this.isLoadingCosteo = false;
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Consolidado_Costeo_Producto.xlsx';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.isLoadingCosteo = false;
              this.CoreAlertService.success(
                'Reporte de costeo por producto generado y descargado exitosamente.',
                '¡Reporte Completado!'
              );
            },
            error: (error: any) => {
              console.error(
                'Error al generar reporte consolidado de costeo:',
                error
              );
              this.CoreAlertService.error(
                'Error de conexión al generar el reporte consolidado de costeo. Verifique su conexión a internet y vuelva a intentar.',
                'Error de Conexión'
              );
              this.isLoadingCosteo = false;
            },
          });
      } else {
        // Si no hay área seleccionada, NO enviar ningún parámetro (consolidado global)
        this.reporstService
          .costeoProductoConsolidado(
            undefined as any,
            undefined as any,
            undefined as any
          )
          .subscribe({
            next: (blob: Blob | null) => {
              if (!blob || blob.size === 0) {
                this.CoreAlertService.error(
                  'Archivo vacío o error al generar el consolidado de costeo por producto.'
                );
                this.isLoadingCosteo = false;
                return;
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Consolidado_Costeo_Producto.xlsx';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.isLoadingCosteo = false;
              this.CoreAlertService.success(
                'Reporte consolidado de costeo por producto generado y descargado exitosamente.',
                '¡Reporte Completado!'
              );
            },
            error: (error: any) => {
              this.CoreAlertService.error(
                'Error al generar el consolidado de costeo por producto. Por favor, intente nuevamente.'
              );
              this.isLoadingCosteo = false;
            },
          });
      }
    });
  }

  // Método para descargar formatos presupuestales generales
  descargarFormatoPresupuestalGeneral(financiamientoId: number): void {
    this.isLoadingFormatoGeneral = true;

    this.currentUser$.pipe(take(1)).subscribe((userData) => {
      if (!userData || !userData.user) {
        this.CoreAlertService.error(
          'No se pudo obtener la información del usuario.'
        );
        this.isLoadingFormatoGeneral = false;
        return;
      }

      // Validar que el usuario sea Admin (puesto 1806)
      if (!this.esAdmin) {
        this.CoreAlertService.error(
          'No tiene permisos para acceder a esta funcionalidad.'
        );
        this.isLoadingFormatoGeneral = false;
        return;
      }

      // Obtener nombre del financiamiento
      const nombreFinanciamiento =
        financiamientoId === 1
          ? 'FONE'
          : financiamientoId === 2
          ? 'MAC'
          : financiamientoId === 3
          ? 'RECURSO ESTATAL'
          : 'DESCONOCIDO';

      console.log(
        `Generando formato presupuestal general para: ${nombreFinanciamiento}`
      );

      // Llamar al endpoint de desglose partida con el financiamiento específico
      const body = {
        ct_financiamiento_id: financiamientoId,
        nombre_usuario: userData.user.nombre_usuario,
        esFormatoPresupuestalGeneral: true,
      };

      console.log('Body enviado al endpoint:', body);

      fetch(`${environment.apiUrlPromette}/excel/desglose-partida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then(async (response) => {
          // Si la respuesta es JSON, puede ser un error
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            if (
              json &&
              (json.msg === 'No hay presupuestos disponibles' ||
                json.msg === 'No se proporcionaron áreas financieras' ||
                json.msg === 'No se encontró el área del usuario.')
            ) {
              this.CoreAlertService.error(
                'Este financiamiento no tiene información'
              );
              throw new Error(json.msg);
            } else if (json && json.msg) {
              this.CoreAlertService.error(json.msg);
              throw new Error(json.msg);
            }
          }
          if (!response.ok) throw new Error('No se pudo descargar el archivo');
          return response.blob();
        })
        .then((blob) => {
          if (!blob || blob.size === 0) {
            this.CoreAlertService.error(
              'Este financiamiento no tiene información'
            );
            this.isLoadingFormatoGeneral = false;
            return;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Formato_Presupuestal_General_${nombreFinanciamiento}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.isLoadingFormatoGeneral = false;
          this.CoreAlertService.success(
            `Formato presupuestal general de ${nombreFinanciamiento} generado y descargado exitosamente.`,
            '¡Reporte Completado!'
          );
        })
        .catch((error) => {
          console.error(
            'Error al generar formato presupuestal general:',
            error
          );
          if (
            error.message &&
            (error.message === 'No hay presupuestos disponibles' ||
              error.message === 'No se proporcionaron áreas financieras' ||
              error.message === 'No se encontró el área del usuario.')
          ) {
            // Ya se mostró el SweetAlert
            this.isLoadingFormatoGeneral = false;
            return;
          }
          this.CoreAlertService.error(
            'Error de conexión al generar el formato presupuestal general. Verifique su conexión a internet y vuelva a intentar.',
            'Error de Conexión'
          );
          this.isLoadingFormatoGeneral = false;
        });
    });
  }
}
