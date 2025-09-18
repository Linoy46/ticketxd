import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HttpClientModule } from '@angular/common/http';
import { CorrespondenceService } from '../correspondence/services/correspondence.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-correspondence-chart',
  templateUrl: './correspondence-chart.component.html',
  standalone: true,
  styleUrls: ['./correspondence-chart.component.scss'],
  imports: [
    NgxChartsModule,
    AgGridAngular,
    CalendarModule,
    FormsModule,
    AutoCompleteModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
})
export class CorrespondenceChartComponent implements OnInit {
  isMobile = false;
  categories: { name: string; count: number; percent: number }[] = [];
  total = 0;
  view: [number, number] = [1600, 400];

  resumenCorrespondencia: any[] = [];

  columnDefs: ColDef[] = [
    {
      field: 'area',
      headerName: 'Área',
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    {
      field: 'totalCorrespondencias',
      headerName: 'Total de correspondencias',
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    {
      field: 'totalResueltas',
      headerName: 'Total resueltas',
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    {
      field: 'totalConcluidas',
      headerName: 'Total concluidas',
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
  ];

  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 200,
      },
      cellClass: 'ag-cell-normal',
      wrapText: false,
      autoHeight: false,
    },
    floatingFilter: true,
    animateRows: false,
    suppressCellFlash: true,
    enableCellChangeFlash: false,
    suppressRowHoverHighlight: true,
    suppressRowTransform: true,
    suppressMovableColumns: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: false,
    rowBuffer: 100,
    immutableData: true,
    immutableColumns: true,
    suppressPropertyNamesCheck: true,
    suppressColumnStateEvents: true,
    suppressClickEdit: true,
    rowHeight: 40,
    headerHeight: 48,
  };

  public myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  rangoFechas: Date[] | null = null;
  today: Date = new Date();
  remitenteFiltro: any = null;
  remitenteSeleccionado: any = null;

  remitenteControl = new FormControl<any>(null);

  remitentesFiltrados: any[] = [];

  // Propiedades para manejo de iOS
  private composing = false;
  private pendingCloseTimer: any = null;
  private lastPointerSelection = false;
  private phantomClickBlockUntil = 0;
  constructor(
    private correspondenceService: CorrespondenceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Inicializa la carga de datos para la gráfica y la tabla
    this.updateChartSize();
    this.cargarResumenPorArea();
    this.updateFilteredData();
    // Detección de móvil para hacer el cambio de gráfico a móvil
    const mq = window.matchMedia('(max-width: 768px)');
    const update = (e: any) => {
      this.isMobile = e.matches ?? e.currentTarget.matches;
    };
    update(mq);
    mq.addEventListener?.('change', update);
  }

  // Solicita el resumen de correspondencia por área desde el backend
  cargarResumenPorArea() {
    this.correspondenceService.obtenerResumenPorArea().subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res;
        this.resumenCorrespondencia = raw.map((item: any) => ({
          area: item.nombre_area || '',
          totalCorrespondencias: Number(item.total_correspondencias) || 0,
          totalResueltas: Number(item.resueltas) || 0,
          totalConcluidas: Number(item.concluidas) || 0,
          remitente: '',
        }));
        this.updateFilteredData();
        // Forzar render en móvil tras carga de datos
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        // Se registra un error si la carga del resumen por área falla.
        // console.error('Error al cargar resumen por área:', err);
        this.resumenCorrespondencia = [];
        this.updateFilteredData();
        this.cdr.detectChanges();
      },
    });
  }

  // Método para ajustar el tamaño del chart según el dispositivo
  updateChartSize() {
    const width = window.innerWidth;
    if (width <= 576) {
      // Mobile
      this.view = [width - 40, 300];
    } else if (width <= 768) {
      // Tablet portrait
      this.view = [width - 60, 350];
    } else if (width <= 1024) {
      // Tablet landscape
      this.view = [width - 80, 380];
    } else {
      // Desktop - mantener tamaño original
      this.view = [1600, 400];
    }
  }

  // Se usa el método para obtener todos los remitentes al iniciar el componente
  filtrarRemitentes(event: any) {
    const query = event.query?.toLowerCase() || '';

    // Evitar búsquedas innecesarias después de seleccionar
    if (Date.now() < this.phantomClickBlockUntil) {
      return;
    }

    // Si no hay query, no buscar
    if (!query || query.length === 0) {
      this.remitentesFiltrados = [];
      return;
    }

    this.correspondenceService
      .obtenerUsuarios(query)
      .subscribe((people: any[]) => {
        let filtered = people;
        if (query.length >= 1) {
          filtered = people.filter((p) => {
            const info = p.informacion || p;
            const nombre = (info.nombre || '').toLowerCase();
            const apellidoPaterno = (info.apellido_paterno || '').toLowerCase();
            const apellidoMaterno = (info.apellido_materno || '').toLowerCase();
            const nombreCompleto =
              `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();

            // Buscar tanto por nombre inicial como por nombre completo
            return (
              nombre.startsWith(query) ||
              apellidoPaterno.startsWith(query) ||
              apellidoMaterno.startsWith(query) ||
              nombreCompleto.includes(query)
            );
          });
        }
        this.remitentesFiltrados = filtered.flatMap((p) => {
          const info = p.informacion || p;
          const nombre = info.nombre || '';
          const apellidoPaterno = info.apellido_paterno || '';
          const apellidoMaterno = info.apellido_materno || '';
          if (Array.isArray(p.puestosYAreas) && p.puestosYAreas.length > 0) {
            return p.puestosYAreas.map((pa: any) => ({
              ...p,
              informacion: info,
              id_usuario_puesto: pa.id_usuario_puesto,
              nombreCompleto: `${nombre} ${apellidoPaterno} ${apellidoMaterno}${
                pa.puesto ? ' - ' + pa.puesto : ''
              }${pa.area ? ' - ' + pa.area : ''}`.trim(),
              puesto: pa.puesto,
              area: pa.area,
              nombre_area: pa.area || '', // Para compatibilidad si se usa en otros lados
            }));
          } else {
            return [
              {
                ...p,
                informacion: info,
                id_usuario_puesto: p.id_usuario_puesto || p.id,
                nombreCompleto:
                  `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim(),
                puesto: '',
                area: '',
                nombre_area: '',
              },
            ];
          }
        });
      });
  }
  // Selecciona un remitente y filtra los datos por remitente y fecha
  onRemitenteSelect(event: any) {
    this.remitenteSeleccionado = event.value;
    this.remitentesFiltrados = [];
    this.filtrarPorRemitenteYFecha();
  }

  // Maneja el evento blur para iOS - valida y corrige la selección
  onRemitenteBlur(event: any) {
    // Timeout para iOS - permite que el evento de selección se complete primero
    setTimeout(() => {
      const inputValue = event.target.value;

      if (inputValue && !this.remitenteSeleccionado) {
        // Buscar coincidencia exacta en las sugerencias
        const match = this.remitentesFiltrados.find(
          (remitente) =>
            remitente.nombreCompleto.toLowerCase() === inputValue.toLowerCase()
        );

        if (match) {
          this.remitenteSeleccionado = match;
          this.remitenteControl.setValue(match);
          this.filtrarPorRemitenteYFecha();
        } else {
          // Si no hay coincidencia exacta, limpiar el campo
          this.remitenteControl.setValue(null);
          this.remitenteSeleccionado = null;
        }
      }
    }, 150);
  }

  filtrarPorRemitenteYFecha() {
    const params: any = {};
    if (this.fechaUnica) {
      params.fechaInicio =
        this.fechaUnica instanceof Date
          ? this.fechaUnica.toISOString().split('T')[0]
          : this.fechaUnica;
    }
    if (
      this.remitenteSeleccionado &&
      this.remitenteSeleccionado.id_usuario_puesto
    ) {
      params.rl_usuario_puesto_id =
        this.remitenteSeleccionado.id_usuario_puesto;
    }
    // Se registran los parámetros que se envían para obtener el resumen por área.
    // console.log('Llamando a obtenerResumenPorArea con:', params);
    this.correspondenceService
      .obtenerResumenPorArea(params.fechaInicio, params.rl_usuario_puesto_id)
      .subscribe({
        next: (res: any) => {
          // Se registra la respuesta del backend al obtener el resumen por área.
          // console.log('Respuesta del backend:', res);
          this.resumenCorrespondencia = Array.isArray(res.data)
            ? res.data.map((item: any) => ({
                area: item.nombre_area || '',
                totalCorrespondencias: Number(item.total_correspondencias) || 0,
                totalResueltas: Number(item.resueltas) || 0,
                totalConcluidas: Number(item.concluidas) || 0,
              }))
            : [];
          this.updateFilteredData();
        },
        error: (err: any) => {
          // Se registra un error si el filtrado por remitente y fecha falla.
          // console.error('Error al filtrar por remitente y fecha:', err);
          this.resumenCorrespondencia = [];
          this.updateFilteredData();
        },
      });
  }

  get filteredResumenCorrespondencia() {
    const sameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    let filtered = this.resumenCorrespondencia;

    // Filtrado por fecha
    if (
      this.rangoFechas &&
      Array.isArray(this.rangoFechas) &&
      this.rangoFechas.length === 1
    ) {
      const selected = this.rangoFechas[0];
      filtered = filtered.filter((item) =>
        sameDay(new Date(item.fechaRecepcion), selected)
      );
    } else if (
      this.rangoFechas &&
      Array.isArray(this.rangoFechas) &&
      this.rangoFechas.length === 2
    ) {
      const [start, end] = this.rangoFechas;
      filtered = filtered.filter((item) => {
        const fecha = new Date(item.fechaRecepcion);
        const f = new Date(
          fecha.getFullYear(),
          fecha.getMonth(),
          fecha.getDate()
        );
        const s = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate()
        );
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return f >= s && f <= e;
      });
    }

    // Filtra los datos por remitente si aplica
    if (this.remitenteFiltro && this.remitenteFiltro.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.remitente &&
          item.remitente
            .toLowerCase()
            .includes(this.remitenteFiltro.toLowerCase())
      );
    }
    return filtered;
  }

  filteredData: any[] = [];

  get totalCorrespondencias() {
    return this.filteredData.reduce((total, item) => total + item.value, 0);
  }

  private updateFilteredData() {
    this.filteredData = this.filteredResumenCorrespondencia.map((item) => ({
      name: item.area,
      value: Number(item.totalCorrespondencias) ?? 0,
    }));
    // Para la vista móvil, el gráfico cambia a barras:
    this.total = this.filteredData.reduce((acc, item) => acc + item.value, 0);
    this.categories = this.filteredData.map((item, i, arr) => {
      const percent = this.total > 0 ? (item.value / this.total) * 100 : 0;
      return {
        name: item.name,
        count: item.value,
        percent: Math.round(percent),
      };
    });
  }

  // Elimina el uso de ngDoCheck para evitar recalculados innecesarios
  fechaUnica: Date | null = null;

  fechagraficofiltrar() {
    this.filtrarPorRemitenteYFecha();
  }

  // Escuchar cambios de tamaño de ventana
  onResize() {
    this.updateChartSize();
  }

  // Métodos para manejo de iOS
  onRawInput(ev: any, tipo: 'remitente') {
    // Evitar búsquedas durante selecciones recientes
    if (Date.now() < this.phantomClickBlockUntil) {
      return;
    }

    const value = ev?.target?.value ?? '';
    // Solo buscar si no hay una selección reciente
    if (!this.lastPointerSelection) {
      this.filtrarRemitentes({ query: value });
    }
  }

  onCompositionStart() {
    this.composing = true;
  }

  onCompositionEnd(ev: any, tipo: 'remitente') {
    this.composing = false;
    // Evitar búsquedas durante selecciones recientes
    if (Date.now() < this.phantomClickBlockUntil) {
      return;
    }

    const value = ev?.target?.value ?? '';
    if (!this.composing && !this.lastPointerSelection) {
      this.filtrarRemitentes({ query: value });
    }
  }

  onAutoFocus(tipo: 'remitente') {
    // Evitar búsquedas durante selecciones recientes
    if (Date.now() < this.phantomClickBlockUntil) {
      return;
    }

    // No buscar automáticamente si ya hay algo seleccionado
    if (this.remitenteSeleccionado) {
      return;
    }

    const val = this.remitenteControl.value;
    if (val && typeof val === 'object' && val.nombreCompleto) {
      // Si ya hay un objeto seleccionado, no buscar más
      return;
    } else if (typeof val === 'string') {
      if (val.length >= 1) {
        this.filtrarRemitentes({ query: val });
      } else {
        this.filtrarRemitentes({ query: 'a' });
      }
    } else {
      this.filtrarRemitentes({ query: 'a' });
    }
  }

  onOptionPointerDown(ev: Event, item: any, tipo: 'remitente') {
    ev.preventDefault();
    ev.stopPropagation();
    this.lastPointerSelection = true;

    // Set the control value and selected remitente
    this.remitenteControl.setValue(item);
    this.remitenteSeleccionado = item;

    // Clear suggestions immediately
    this.remitentesFiltrados = [];

    // Block phantom clicks for longer period
    this.phantomClickBlockUntil = Date.now() + 800;

    // Blur the input to close dropdown
    try {
      const inputBlur: HTMLInputElement | null =
        document.querySelector('input#remitente');
      inputBlur?.blur();
    } catch {}

    // Execute the filter after a small delay to ensure selection is complete
    setTimeout(() => {
      this.filtrarPorRemitenteYFecha();
    }, 50);
  }

  onInputBlur(tipo: 'remitente') {
    if (this.pendingCloseTimer) clearTimeout(this.pendingCloseTimer);
    this.pendingCloseTimer = setTimeout(() => {
      if (!this.lastPointerSelection) {
        this.remitentesFiltrados = [];
      }
      this.lastPointerSelection = false;
    }, 80);
  }
}
