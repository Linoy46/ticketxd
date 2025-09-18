import { AfterViewInit, Component } from '@angular/core';
import { CursesService } from './services/curses.service';
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { CanvaComponent } from '../canva/canva.component';
import { SharedActionsGridComponent } from '../../shared/shared-actions-grid/shared-actions-grid.component';
import { CoreModalService } from '../../core/services/core.modal.service';
import { SharedCustomModalComponent } from '../../shared/shared-custom-modal/shared-custom-modal.component';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-curses',
  imports: [
    AgGridAngular,
    CommonModule,
    CanvaComponent,
    SharedCustomModalComponent,
  ],
  templateUrl: './curses.component.html',
  styleUrl: './curses.component.scss',
})
export class CursesComponent implements AfterViewInit {
  public rowData: any[] = [];
  public myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  public columnDefs: ColDef[] = [
    {
      field: 'area',
      headerName: 'Nombre del Área',
      flex: 1,
    },

    {
      field: 'claveCurso',
      headerName: 'Curso',
      flex: 1,
    },

    {
      field: 'actions',
      headerName: 'Acciones',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SharedActionsGridComponent,

      cellRendererParams: {
        onCreateCanva: this.createCanva.bind(this),
      },
      flex: 1,
      maxWidth: 215,
      // Configura el ancho de la columna de acciones.
    },
  ];

  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    columnChooser: true,
    // Habilita el selector de columnas para que el usuario pueda elegir qué columnas ver.
  };

  public isMobile = false;
  public isTablet = false;

  constructor(
    private cusrsesService: CursesService,
    private modalService: CoreModalService
  ) {}

  ngAfterViewInit(): void {
    this.checkDeviceType();
    this.setupColumnDefs();
    this.loadData();
    window.addEventListener('resize', () => {
      this.checkDeviceType();
      this.setupColumnDefs();
    });
  }

  private checkDeviceType(): void {
    if (window.innerWidth < 768) {
      this.isMobile = true;
      this.isTablet = false;
    } else if (window.innerWidth < 1024) {
      this.isMobile = false;
      this.isTablet = true;
    } else {
      this.isMobile = false;
      this.isTablet = false;
    }
  }

  private setupColumnDefs(): void {
    if (this.isMobile) {
      this.columnDefs = [
        {
          field: 'area',
          headerName: 'Área',
          flex: 2,
          minWidth: 180,
        },
        {
          field: 'claveCurso',
          headerName: 'Curso',
          flex: 2,
          minWidth: 160,
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          cellStyle: { textAlign: 'center' },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: {
            onCreateCanva: this.createCanva.bind(this),
          },
          flex: 1,
          minWidth: 120,
          maxWidth: 180,
        },
      ];
    } else if (this.isTablet) {
      this.columnDefs = [
        {
          field: 'area',
          headerName: 'Área',
          flex: 3,
          minWidth: 220,
        },
        {
          field: 'claveCurso',
          headerName: 'Curso',
          flex: 3,
          minWidth: 200,
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          cellStyle: { textAlign: 'center' },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: {
            onCreateCanva: this.createCanva.bind(this),
          },
          flex: 2,
          minWidth: 150,
          maxWidth: 220,
        },
      ];
    } else {
      this.columnDefs = [
        {
          field: 'area',
          headerName: 'Nombre del Área',
          flex: 1,
        },
        {
          field: 'claveCurso',
          headerName: 'Curso',
          flex: 1,
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          cellStyle: { textAlign: 'center' },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: {
            onCreateCanva: this.createCanva.bind(this),
          },
          flex: 1,
          maxWidth: 215,
        },
      ];
    }
  }

  loadData(): void {
    this.cusrsesService.getData().subscribe({
      next: (data) => {
        this.rowData = [...data.certificates];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  createCanva(row: any) {
    this.modalService.open(CanvaComponent, 'Crear constancia', {
      data: { mode: 'createCanva', row },
    });
  }
}
