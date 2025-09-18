import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ModulesService } from '../services/modules.service';
import { ModalData, Module } from '../interfaces/interfaces';
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
    //AutoComplete,
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

  public modules: any[] = [];
  public selectedModule: any;
  public filteredModules!: any[];
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(private fb: FormBuilder, private modulesService: ModulesService) {
    this.form = this.fb.group({
      id_modulo:[],
      nombre_modulo: ['', Validators.required],
      modulo_padre: [0, Validators.required],
      // clave: ['', Validators.required],
      // icono: ['', Validators.required],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
      estado: [],
    });
  }

  ngOnInit() {
    this.loadModules();
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_modulo);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  loadModules(): void {
    this.modulesService.getDataModules().subscribe({
      next: (data) => {
        this.modules = [...data.modules];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  loadData(id_modulo?: number) {
    if (id_modulo) {
      this.modulesService.get(id_modulo).subscribe((record) => {
        this.form.patchValue({
          ...record.module,
          ct_usuario_at: this.user.id_usuario,
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.modulesService.add(this.form.value).subscribe();
        this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_modulo) {
        this.modulesService.edit(this.data.id_modulo, this.form.value).subscribe();
        this.data?.loadData?.();
      }
    }
  }

  filterModule(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.modules as any[]).length; i++) {
      let module = (this.modules as any[])[i];

      if (
        module.nombre_modulo
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        filtered.push(module);
      }
    }

    this.filteredModules = filtered;
  }

  onModuleSelect(event: any) {
    // Guardar solo el ID del área en el formulario
    this.form.get('modulo_padre')?.setValue(event.value.id_modulo);
    this.form.get('ct_modulo')?.setValue(event.value.nombre_modulo);
  }
}
