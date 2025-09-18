import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { UserPositionsService } from '../services/user.positions.service';
import { ModalData, UserPosition } from '../interfaces/interfaces';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../../../store';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CoreModalService } from '../../../../../../core/services/core.modal.service';
import { UserPositionComponent } from '../user-position.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-form-user-position',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,
    AutoComplete,
    CalendarModule,
    DatePickerModule,
  ],
  templateUrl: './form-user-position.component.html',
  styleUrl: './form-user-position.component.css',
  standalone: true,
})
export class FormUserPositionComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  @Input() data?: ModalData;
  @Input() close!: () => void;
  form: FormGroup;
  id: number | null = null; // ID del registro (para editar/ver)
  date: Date | undefined;

  public areas: any[] = [];
  public positions: any[] = [];
  public selectedPosition: any;
  public filteredPositions!: any[];

  public sindicates: any[] = [];
  public selectedSindicate: any;
  public filteredSindicates!: any[];
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
      private modalService: CoreModalService,
      private fb: FormBuilder, private userPositionsService: UserPositionsService) {
    this.form = this.fb.group({
      id_usuario_puesto:[],
      ct_usuario_id:['', Validators.required],
      ct_puesto: [''],
      ct_puesto_id:['', Validators.required],
      periodo_inicio: [null, Validators.required], // Valor inicial en null
      periodo_final: [null], // Valor inicial en null
      plaza: ['', Validators.required],
      ct_sindicato: [''],
      ct_sindicato_id: ['', Validators.required],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
    });
  }

  ngOnInit() {
    forkJoin([
      this.userPositionsService.getDataAreas(),
      this.userPositionsService.getDataPositions()
    ]).subscribe(([areas, dataPositions]) => {
      this.areas = [...areas];
      // console.log('ÁREAS', this.areas);
      // console.log('PUESTOS', dataPositions.positions);
      // console.log('Ejemplo de ID comparables:');
      // console.log('Área ID:', typeof this.areas[0]?.id_area, this.areas[0]?.id_area);
      // console.log('Puesto área ID:', typeof dataPositions.positions[0]?.ct_area_id, dataPositions.positions[0]?.ct_area_id);
      const areaMap = new Map<number, string>();
      this.areas.forEach(area => {
        areaMap.set(area.id_area, area.nombre);
      });

      this.positions = dataPositions.positions.map((position: any) => {
        return {
          ...position,
          nombre_area: areaMap.get(position.ct_area_id) || 'Área desconocida',
        };
      });
      // console.log('PUESTOS CON ÁREA:', this.positions);
    });

    this.loadSindicates();
    this.form.patchValue({ ct_usuario_id: this.data?.ct_usuario_id });
    this.form.patchValue({ id_usuario_puesto: this.data?.id_usuario_puesto });

    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_usuario_puesto);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  loadPositions(): void {
    this.userPositionsService.getDataPositions().subscribe({
      next: (data) => {
        // Mapeo de ID de área a nombre
        const areaMap = new Map<number, string>();
        this.areas.forEach(area => {
          areaMap.set(area.id_area, area.nombre_area);
        });

        // Agregar nombre del área a cada posición
        this.positions = data.positions.map((position: any) => {
          return {
            ...position,
            nombre_area: areaMap.get(position.ct_area_id) || 'Área desconocida',
          };
        });
      },
      error: (error) => {
        console.error('Error al cargar los datos de puestos:', error);
      },
    });
  }

  loadAreas(): void {
    this.userPositionsService.getDataAreas().subscribe({
      next: (areas) => {
        this.areas = [...areas];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadSindicates(): void {
    this.userPositionsService.getDataSindicates().subscribe({
      next: (data) => {
        this.sindicates = [...data.sindicates];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadData(id_usuario_puesto?: number) {
    if (id_usuario_puesto) {
    this.userPositionsService.get(id_usuario_puesto).subscribe((record) => {
      const UserPositions = record.userPosition;
        console.log("Data recovered: ",UserPositions)
        this.form.patchValue({
          ...record.userPosition,
          ct_puesto: UserPositions.ct_puesto.nombre_puesto || null,
          ct_puesto_id: UserPositions.ct_puesto_id || '',
          ct_sindicato: UserPositions.ct_sindicato.nombre_sindicato || null,
          ct_sindicato_id: UserPositions.ct_sindicato_id || '',
          periodo_inicio: new Date(UserPositions.periodo_inicio), // Conversión a Date
          periodo_final: UserPositions.periodo_final
            ? new Date(UserPositions.periodo_final)
            : null, // Conversión a Date
          ct_usuario_at: this.user.id_usuario,
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.userPositionsService.add(this.form.value).subscribe({
          next: () => {
            this.modalService.open(UserPositionComponent, 'Ver registros', {
              data: { mode: 'view', ct_usuario_id: this.form.value.ct_usuario_id },
            });
          },
          error: (err) => console.error('Error al guardar el puesto:', err),
        });
        //this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_usuario_puesto) {
        this.userPositionsService.edit(this.data.id_usuario_puesto, this.form.value).subscribe({
          next: () => {
            this.modalService.open(UserPositionComponent, 'Ver registros', {
              data: { mode: 'view', ct_usuario_id: this.form.value.ct_usuario_id },
            });
          },
          error: (err) => console.error('Error al editar el puesto:', err),
        });
        //this.data?.loadData?.();
      }
    }
  }

  filterPosition(event: AutoCompleteCompleteEvent) {
    const normalize = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const query = normalize(event.query);

    this.filteredPositions = this.positions.filter((position: any) => {
      const puesto = normalize(position.nombre_puesto || '');
      const area = normalize(position.nombre_area || '');

      return puesto.includes(query) || area.includes(query);
    });
  }

  onPositionSelect(event: any) {
    // Guardar solo el ID del puesto en el formulario
    this.form.get('ct_puesto_id')?.setValue(event.value.id_puesto);
    let nombre_puesto_area : any = event.value.nombre_puesto + " - " + event.value.nombre_area
    this.form.get('ct_puesto')?.setValue(nombre_puesto_area);
  }

  filterSindicate(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.sindicates as any[]).length; i++) {
      let sindicate = (this.sindicates as any[])[i];

      if (
        sindicate.nombre_sindicato
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        filtered.push(sindicate);
      }
    }

    this.filteredSindicates = filtered;
  }

  onSindicateSelect(event: any) {
    // Guardar solo el ID del puesto en el formulario
    this.form.get('ct_sindicato_id')?.setValue(event.value.id_sindicato);
    this.form.get('ct_sindicato')?.setValue(event.value.nombre_sindicato);
  }

}
