import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalData, Function } from './interfaces/interfaces';
import { FunctionsService } from './services/functions.service';
import { CoreModalService } from '../../../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';
import { FormFunctionComponent } from './form-function/form-function.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../../store';


@Component({
  selector: 'app-function',
  imports: [CommonModule],
  templateUrl: './function.component.html',
  styleUrl: './function.component.css'
})
export class FunctionComponent implements AfterViewInit  {
  public rowData: any[] = [];
  @Input() data?: ModalData;

  private userSelector = injectSelector<RootState, any>(
      (state) => state.auth.user
    );
 // Aquí se obtiene el usuario con un getter
 get user() {
  return this.userSelector(); // Se actualiza automáticamente
}

  constructor(
    private modalService: CoreModalService,
    private functionsService: FunctionsService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService
  ) {}

  ngAfterViewInit() {
    //console.log("ID Módulo: ",this.data?.id_modulo)
    if (this.data?.mode === 'view') {
      this.loadFunctions(this.data?.id_modulo);
    }
  }

  loadData(id?: number): void {
    if (id) {
      this.functionsService.get(id).subscribe({
        next: (data) => {
          this.rowData = [...data.functions];
        },
        error: (error) => {
          console.error('Error al cargar los datos:', error);
        },
      });
    }
  }

  loadFunctions(id?: number): void {
    if (id) {
      this.functionsService.getFunctions(id).subscribe({
        next: (data) => {

        // Asegúrate de que `data.moduleArea` es un array antes de intentar asignarlo
        if (Array.isArray(data.functions)) {
          this.rowData = [...data.functions];  // Solo asignamos si es un array
        } else {
          this.rowData = [];  // Si no es un array, asignamos un array vacío
        }

        if (this.rowData.length === 0) {
          console.log('No hay registros para mostrar.');
        }
        },
        error: (error) => {
          console.error('Error al cargar los datos:', error);
        },
      });
    }
  }

  edit(row: number) {
    this.modalService.open(FormFunctionComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_funcion: row,
        loadData: this.loadFunctions.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_funcion}?`,
        'Eliminar registro',
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.functionsService.delete(this.user.id_usuario,row.id_funcion).subscribe({
            next: () => {
              this.loadFunctions(row.ct_modulo_id); // Recargar los datos después de eliminar// Reaplicar el ID del área
            },
            error: (error) => {
              this.alertService.error('No se pudo eliminar el registro.');
            },
          });
        }
      });
  }

  add(row: any) {
    this.modalService.open(FormFunctionComponent, 'Agregar función', {
      data: {
        mode: 'add',
        id_modulo : row,
        loadData: this.loadData.bind(this)
      }
    });
  }

}
