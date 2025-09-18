import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { DepartmentsService } from '../services/departments.service';
import { ModalData, Department } from '../interfaces/interfaces';
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
  @Input() data?: ModalData; // Modo del formulario
  @Input() close!: () => void;
  form: FormGroup;
  id: number | null = null; // ID del registro (para editar/ver)

  public directions: any[] = [];
  public departments: any[] = [];
  public selectedDirection: any;
  public filteredDirections!: any[];

  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
    private fb: FormBuilder,
    private departmentsService: DepartmentsService) {
    this.form = this.fb.group({
      id_departamento:[],
      nombre_departamento: ['', Validators.required],
      ct_direccion: ['', Validators.required],
      ct_direccion_id: ['', Validators.required],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
      estado: [],
    });
  }

  ngOnInit() {
    this.loadDirections();
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_departamento);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  loadDirections(): void {
    this.departmentsService.getDataDirections().subscribe({
      next: (data) => {
        this.directions = [...data.directions];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadData(id_departamento?: number) {
    if (id_departamento) {
      this.departmentsService.get(id_departamento).subscribe((record) => {
        this.form.patchValue({
          ...record.department,
          ct_usuario_at: this.user.id_usuario,
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.departmentsService.add(this.form.value).subscribe(() => {
          this.close();
          this.loadData();
          }
        );
      } else if (this.data?.mode === 'edit' && this.data.id_departamento) {
        this.departmentsService.edit(this.data.id_departamento, this.form.value).subscribe(() => {
          this.close();
          this.loadData();
        });
      }
    }
  }

  filterDirection(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.directions as any[]).length; i++) {
      let direction = (this.directions as any[])[i];

      if (
        direction.nombre_direccion
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        filtered.push(direction);
      }
    }

    this.filteredDirections = filtered;
  }

  onDirectionSelect(event: any) {
    // Guardar solo el ID del área en el formulario
    this.form.get('ct_direccion_id')?.setValue(event.value.id_direccion);
    this.form.get('ct_direccion')?.setValue(event.value.nombre_direccion);
  }
}
