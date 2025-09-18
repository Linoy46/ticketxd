import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DirectionsService } from '../services/directions.service';
import { ModalData, Direction } from '../interfaces/interfaces';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,
    AutoComplete,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  @Input() data?: ModalData; // Modo del formulario
  @Input() close!: () => void;
  form: FormGroup;
  id: number | null = null; // ID del registro (para editar/ver)

  public directions: any[] = [];

  allOptions = [
    { label: 'SEPE', value: 1 },
    { label: 'USET', value: 2 },
    { label: 'Dirección General SEPE/USET', value: 3 },
  ]; // Opciones disponibles
  filteredOptions: any[] = []; // Opciones filtradas

  constructor(
    private fb: FormBuilder,
    private directionsService: DirectionsService) {
    this.form = this.fb.group({
      id_direccion:[],
      nombre_direccion: ['', Validators.required],
      ct_dependencia: [null, Validators.required],
      ct_dependencia_id: [null, Validators.required],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
    });
  }

  filterOptions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredOptions = this.allOptions.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  }

  onOptionSelect(event: any) {
    const selectedValue = event?.value.value || event; // Si no tiene `value`, usar todo el evento
    const selectedLabel = event?.value.label || event; // Si no tiene `value`, usar todo el evento
    this.form.get('ct_dependencia')?.setValue(selectedLabel);
    this.form.get('ct_dependencia_id')?.setValue(selectedValue);
    console.log('Valor seleccionado:', selectedValue);
  }

  loadData(id_direccion?: number) {
    if (id_direccion) {
      this.directionsService.get(id_direccion).subscribe((record) => {
        this.form.patchValue({
          ...record.direction,
          ct_dependencia_id: record.direction.ct_dependencia_id.value || record.direction.ct_dependencia_id, // Extraer el valor si es un objeto
          ct_usuario_at: this.user.id_usuario,
        });

        const dependenciaMapping = {
          1: 'SEPE',
          2: 'USET',
          3: 'Dirección General SEPE/USET'
        };

      // Obtener ct_dependencia_id
      const ctDependenciaId = this.form.get('ct_dependencia_id')?.value;

      // Aseguramos que ctDependenciaId es un número y usamos como índice
      if (typeof ctDependenciaId === 'number') {
        // Aseguramos a TypeScript que `ctDependenciaId` es un número
        this.form.get('ct_dependencia')?.setValue(dependenciaMapping[ctDependenciaId as keyof typeof dependenciaMapping]);
      }

      });
    }
  }

  ngOnInit() {
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_direccion);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.directionsService.add(this.form.value).subscribe(() => {
          this.loadData();
          this.close();
        });
        this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_direccion) {
        this.directionsService.edit(this.data.id_direccion, this.form.value).subscribe(() => {
          this.loadData();
          this.close();
        });
      }
    }
  }
}
