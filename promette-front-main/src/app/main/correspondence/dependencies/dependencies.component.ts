import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { FormComponent } from '../../system-admin/users/form/form.component';
import { SharedBreadCrumbComponent } from '../../../shared/shared-bread-crumb/shared-bread-crumb.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'dependencies-component',
  imports: [
    AgGridAngular,
    CommonModule,
    SharedCustomModalComponent,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './dependencies.component.html',
  styleUrl: './dependencies.component.scss',
})
export class DependenciesComponent {
  constructor(private modalService: CoreModalService) {}
  // Row Data: The data to be displayed.
  value: string = '';
  rowData = [
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  ];

  // Column Definitions: Defines the columns to be displayed.
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
      field: 'organismo',
      headerName: 'Organismo',
      flex: 2,
    },
    {
      field: 'dependencia',
      headerName: 'Dependencia',
      flex: 2,
    },
    {
      field: 'vigente',
      headerName: 'Vigente',
      flex: 1,
      maxWidth: 130,
    },
    {
      field: 'actions',
      headerName: 'Editar',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SharedActionsGridComponent,

      cellRendererParams: {
        onEdit: this.edit.bind(this),
      },
      flex: 1,
      maxWidth: 130,
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
  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_area: row.id_area,
      },
    });
  }

  add() {
    this.modalService.open(SharedBreadCrumbComponent, 'Agregar registro', {
      data: { mode: 'add' },
    });
  }
}
