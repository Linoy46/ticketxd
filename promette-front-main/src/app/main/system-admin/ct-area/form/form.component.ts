import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { AreasService } from '../services/areas.service';
import { ModalData, Area } from '../interfaces/interfaces';
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

  public departments: any[] = [];
  public selectedDepartment: any;
  public filteredDepartments!: any[];
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
    private fb: FormBuilder,
    private areasService: AreasService) {
    this.form = this.fb.group({
      nombre_area: ['', Validators.required],
      ct_departamento_id: ['', Validators.required],
      ct_departamento: [''],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
      estado: [],
    });
  }

  ngOnInit() {
    this.loadDepartments();
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_area);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  loadDepartments(): void {
    this.areasService.getDataDepartments().subscribe({
      next: (data) => {
        this.departments = [...data.departments];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadData(id_area?: number) {
    if (id_area) {
      this.areasService.get(id_area).subscribe((record) => {
        const area = record.area;
        this.form.patchValue({
          ...record.area,
          ct_departamento_id: area.ct_departamento_id || null,
          ct_departamento: area.ct_departamento?.nombre_departamento || '',
          ct_usuario_at: this.user.id_usuario,
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.areasService.add(this.form.value).subscribe();
        this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_area) {
        this.areasService.edit(this.data.id_area, this.form.value).subscribe();
        this.data?.loadData?.();
      }
    }
  }

  filterDepartment(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.departments as any[]).length; i++) {
      let department = (this.departments as any[])[i];

      if (
        department.nombre_departamento
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        filtered.push(department);
      }
    }

    this.filteredDepartments = filtered;
  }

  onDepartmentSelect(event: any) {
    // Guardar solo el ID del departamento en el formulario
    this.form.get('ct_departamento_id')?.setValue(event.value.id_departamento);
    this.form.get('ct_departamento')?.setValue(event.value.nombre_departamento);
  }
}
