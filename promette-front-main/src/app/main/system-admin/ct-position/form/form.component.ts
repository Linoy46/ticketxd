import { Component, effect, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { PositionsService } from '../services/positions.service';
import { ModalData, Position } from '../interfaces/interfaces';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
@Component({
  selector: 'form-component',
  templateUrl: './form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,
    AutoComplete,
  ],
})
export class FormComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  @Input() data?: ModalData; // Modo del formulario
  @Input() close!: () => void;
  form: FormGroup;
  id: number | null = null; // ID del registro (para editar/ver)
  ct_area_id: any

  public areas: any[] = [];
  public area: any[] = [];
  public selectedArea: any;
  public filteredAreas!: any[];
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(private fb: FormBuilder, private positionsService: PositionsService) {
    this.form = this.fb.group({
      nombre_puesto: ['', Validators.required],
      ct_area_id: ['', Validators.required],
      ct_area: [''],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
    });

  }

ngOnInit() {
  //console.log('Valor inicial de ct_area_id:', this.form.get('ct_area_id')?.value, this.data);

  this.loadAreas();

  if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
    this.loadData(this.data.id_puesto).then((ct_area_id) => {
      //console.log('Valor de ct_area_id desde loadData:', ct_area_id);
      if (ct_area_id) {
        this.form.get('ct_area_id')?.setValue(ct_area_id); // Opcional: establece el valor en el formulario
        this.loadArea(ct_area_id);
      } else {
        this.form.get('ct_area')?.setValue("SEPE - USET");
        //console.error('ct_area_id no es válido.');
      }
    });
  }

  if (this.data?.mode === 'view') {
    this.form.disable();
  }
}

  loadAreas(): void {
    this.positionsService.getDataAreas().subscribe({
      next: (areas) => {
        this.areas = [...areas];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadArea(id_area: number): void {
    //console.log(id_area)
    if (id_area !== 0){
      this.positionsService.getArea(id_area).subscribe({
        next: (area) => {
          this.area = area;
          this.form.get('ct_area')?.setValue(area.nombre);
        },
        error: (error) => {
          //console.error('Error al cargar los datos:', error);
        },
      });
    }else if (id_area == 0){
      this.form.get('ct_area')?.setValue("SEPE - USET");
    }
  }

  loadData(id_puesto?: number): Promise<number | undefined> {
  return new Promise((resolve, reject) => {
    if (id_puesto) {
      this.positionsService.get(id_puesto).subscribe({
        next: (record) => {
          this.form.patchValue({
            ...record.position,
            ct_usuario_at: this.user.id_usuario,
          });
          resolve(record.position.ct_area_id);
        },
        error: (error) => reject(error),
      });
    } else {
      resolve(undefined); // En caso de que no haya `id_puesto`
    }
  });
}

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.positionsService.add(this.form.value).subscribe();
        this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_puesto) {
        this.positionsService.edit(this.data.id_puesto, this.form.value).subscribe();
        this.data?.loadData?.();
      }
    }
  }

  filterArea(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.areas as any[]).length; i++) {
      let area = (this.areas as any[])[i];

      if (
        area.nombre
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        filtered.push(area);
      }
    }

    this.filteredAreas = filtered;
  }

  onAreaSelect(event: any) {
    // Guardar solo el ID del área en el formulario
    this.form.get('ct_area_id')?.setValue(event.value.id_area);
    this.form.get('ct_area')?.setValue(event.value.nombre);
  }
}
