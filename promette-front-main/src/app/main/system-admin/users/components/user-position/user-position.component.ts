import { Component, Input, AfterViewInit } from '@angular/core';
import { ModalData } from './interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { CoreModalService } from '../../../../../core/services/core.modal.service';
import { UserPositionsService } from './services/user.positions.service';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';
import { FormUserPositionComponent } from './form-user-position/form-user-position.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../../store';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'user-position-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-position.component.html',
  styleUrl: './user-position.component.css'
})
export class UserPositionComponent implements AfterViewInit {
  public rowData: any[] = [];
  public areas: any[] = [];

  private userSelector = injectSelector<RootState, any>(state => state.auth.user);
  get user() {
    return this.userSelector();
  }

  @Input() data?: ModalData;

  constructor(
    private modalService: CoreModalService,
    private userPositionsService: UserPositionsService,
    private alertService: CoreAlertService
  ) {}

  ngAfterViewInit() {
    if (this.data?.mode === 'view') {
      this.loadUserPositions(this.data?.ct_usuario_id);
    }
  }

  loadUserPositions(id?: number): void {
    if (!id) return;

    forkJoin([
      this.userPositionsService.getUserPositions(id),
      this.userPositionsService.getDataAreas()
    ]).subscribe({
      next: ([userData, areaList]) => {
        const puestos = Array.isArray(userData.userPosition)
          ? userData.userPosition
          : [];

        const areaInfoMap = new Map<number, {
          area: string;
          departamento: string;
          direccion: string;
        }>();

        areaList.forEach((area: any) => {
          const departamento = area.id_departamento_ct_infraestructura_departamento;
          const direccion = departamento?.id_direccion_ct_infraestructura_direccion;

          areaInfoMap.set(area.id_area, {
            area: area.nombre,
            departamento: departamento?.nombre || 'Departamento desconocido',
            direccion: direccion?.nombre || 'Dirección desconocida',
          });
        });

        this.rowData = puestos.map((position: any) => {
          const info = areaInfoMap.get(position.ct_puesto?.ct_area_id);
          return {
            ...position,
            nombre_area: info?.area || 'Área desconocida',
            nombre_departamento: info?.departamento || 'Departamento desconocido',
            nombre_direccion: info?.direccion || 'Dirección desconocida',
          };
        });
      },
      error: (error) => {
        console.error('Error al cargar puestos o áreas:', error);
        this.rowData = [];
      },
    });
  }

  loadData(id?: number): void {
    if (id) {
      this.userPositionsService.get(id).subscribe({
        next: (data) => {
          this.rowData = Array.isArray(data.userPosition) ? [...data.userPosition] : [];
        },
        error: (error) => {
          console.error('Error al cargar los datos:', error);
          this.rowData = [];
        },
      });
    }
  }

  edit(row: number) {
    this.modalService.open(FormUserPositionComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_usuario_puesto: row,
        loadData: this.loadData.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService.confirm(
      `¿Seguro que deseas eliminar a ${row.ct_puesto.nombre_puesto}?`,
      'Eliminar registro'
    ).then((result) => {
      if (result.isConfirmed) {
        this.userPositionsService.delete(this.user.id_usuario, row.id_usuario_puesto).subscribe({
          next: () => {
            this.loadUserPositions(row.ct_usuario_id);
          },
          error: () => {
            this.alertService.error('No se pudo eliminar el registro.');
          },
        });
      }
    });
  }

  add() {
    this.modalService.open(FormUserPositionComponent, 'Asignar puesto', {
      data: {
        mode: 'add',
        ct_usuario_id: this.data?.ct_usuario_id,
        loadData: this.loadData.bind(this),
      },
    });
  }
}
