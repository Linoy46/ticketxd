import { Component, effect, Input, OnInit } from '@angular/core';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { OutsService } from '../../../consumables/outs/services/outs.service';
import { FormsModule } from '@angular/forms';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { AdministrativeService } from '../services/administrative.service';
import { DropdownModule } from 'primeng/dropdown';
import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../../shared/shared-actions-grid/shared-actions-grid.component';
import { localeText } from '../../../../core/helpers/localText';
import { AgGridAngular } from 'ag-grid-angular';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'select-partida-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    DropdownModule,
    TableModule,
    ButtonModule
  ],
  templateUrl: './select-partida.component.html',
  styleUrl: './select-partida.component.scss'
})
export class SelectPartidaComponent implements OnInit {
  @Input() dataRow:  { id_financiero:number,id_area_fin: number; nombre_area: string} | null = null;
  partidas: any[] = [];
  id_partida_seleccionada: number | null = null;
  id_area: number = 0;
  displayData: any[] = [];
  loading: boolean = false;

  private userSelector = injectSelector<RootState, any>((state) => state.auth);
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }
  constructor(
    private modalService: CoreModalService,
    private alertService: CoreAlertService,
    private admministrativeService: AdministrativeService,
    private outsService: OutsService,
  ) {
    // obtener id del usuario
    effect(() => {
      const user = this.user;
    });
  }

  ngOnInit(){
    console.log("Mandando info")
    this.cargarPartidas(); //carga las partidad del select
    if (this.dataRow?.id_area_fin) {
      this.cargarPartidasPorArea(this.dataRow.id_area_fin);
    }
  }

  cargarPartidas(){
    if (!this.dataRow?.id_area_fin) {
      this.alertService.error('No se ha especificado el área financiera');
      return;
    }
    this.loading = true;
    this.admministrativeService.getPartidas(this.dataRow.id_area_fin).subscribe({
      next: (items) => {
          this.partidas = items.partidas;
          console.log(this.partidas);
          this.loading = false;
        },
        error: (err) => {
          this.alertService.error(err.error.msg);
          console.error(err)
          this.loading = false;
        },
    });
  }

  cargarPartidasPorArea(id:number){
    this.loading = true;
    this.admministrativeService.partidasPorArea(id).subscribe({
     next: (items) => {
          this.displayData = items.partidas;
          //console.log( this.displayData);
          this.loading = false;
        },
        error: (err) => {
          this.alertService.error(err.msg);
          console.error(err)
          this.loading = false;
        },
    })
  }

  eliminarPartida(partida: any) {
    this.alertService.confirm(
      '¿Está seguro de eliminar esta partida?',
      'Eliminar Partida'
    ).then(() => {
      this.loading = true;
      this.admministrativeService.eliminarPartidaArea(partida.id_partida_area, this.user.user.id_usuario).subscribe({
        next: () => {
          this.alertService.success('Partida eliminada correctamente', 'Éxito');
          this.cargarPartidasPorArea(this.dataRow?.id_area_fin || 0);
          this.loading = false;
        },
        error: (error: any) => {
          this.alertService.error(error.msg || 'Error al eliminar la partida');
          console.error(error);
          this.loading = false;
        }
      });
    });
  }

  guardarPartida(){
    if (!this.id_partida_seleccionada) {
      this.alertService.error('Debe seleccionar una partida');
      return;
    }
    this.loading = true;
    console.log("Mandando info")
    console.log("id_area_fin: ",this.dataRow?.id_area_fin);
    console.log("id_partida: ",this.id_partida_seleccionada);
    console.log("ct_usuario_in: ",this.user.user.id_usuario);

    this.admministrativeService.registroAreaPartida({id_area_fin:this.dataRow?.id_area_fin,id_partida:this.id_partida_seleccionada,ct_usuario_in:this.user.user.id_usuario}).subscribe({
      next: (response) => {
          this.alertService.success("Se ha asignado correctamente la partida","Partida Registrada")
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          if (error.status === 409) {
            this.alertService.warning("Esta partida ya está asignada a la unidad administrativa", "Partida ya asignada");
          } else {
            this.alertService.error("Hubo un error al generar la relación entre partida y área");
          }
          this.loading = false;
        },
    });
  }

  closeModal(){
    this.modalService.close();
  }

  //AG-Grid
    myTheme = themeQuartz.withParams({
      spacing: 10,
      foregroundColor: '#422b7c',
      headerBackgroundColor: '#e9ddff',
      rowHoverColor: '#fdf7ff',
    });

    public paginationPageSize = 4;
    public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

    columnDefs: ColDef[] = [
      {
        field: 'id_partida_ct_partida.clave_partida',
        headerName: 'Clave Partida',
        flex: 2,
        filter: true,
        maxWidth: 200,
        sortable: true,
      },
      {
        field: 'id_partida_ct_partida.nombre_partida',
        headerName: 'Partida',
        flex: 2,
        filter: true,
        sortable: true,
      },
      {
        headerName: 'Acciones',
        cellStyle: { textAlign: 'center' },
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: {
          onDelete: this.delete.bind(this),
        },
        flex: 1,
        maxWidth: 120,
        filter: false,
      },
    ];

    public gridOptions: GridOptions = {
      defaultColDef: {
        flex: 1,
        filter: true,
        sortable: true,
        resizable: true,
      },
      localeText: localeText,
      sideBar: {
        toolPanels: ['columns'],
      },
      pagination: true,
      paginationPageSize: this.paginationPageSize,
      paginationPageSizeSelector: this.paginationPageSizeSelector,
    };

    delete(event: any):void{
      console.log("BORRANDO RESTRINCCION DE PARTIDA")
      this.alertService.confirm(
      `¿Está seguro que desea habilitar la partida "${event.nombre_partida}" para esta área?`,
      'Habilitar área'
    ).then((result) => {
      if (result.isConfirmed) {
        this.alertService.success("Se ha habilidado correctamente","Habilitar partida")
        this.closeModal();
      }else{
        this.alertService.error("Ha ocurrido un error al volver a habilitar la partida", "Error")
        this.closeModal();
      }
    });
    }
}
