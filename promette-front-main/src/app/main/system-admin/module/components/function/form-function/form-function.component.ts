import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FunctionsService } from '../services/functions.service';
import { ModalData, Function } from '../interfaces/interfaces';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../../../store';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CoreModalService } from '../../../../../../core/services/core.modal.service';
import { FunctionComponent } from '../function.component';

@Component({
  selector: 'app-form-function',
  templateUrl: './form-function.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,
  ],
  styleUrl: './form-function.component.css'
})
export class FormFunctionComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  @Input() data?: ModalData;
  @Input() close!: () => void;
  form: FormGroup;
  id: number | null = null; // ID del registro (para editar/ver)

  public functions: any[] = [];

  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
    private modalService: CoreModalService,
    private fb: FormBuilder,
    private functionsService: FunctionsService) {
    this.form = this.fb.group({
      id_funcion:[],
      ct_modulo_id:['', Validators.required],
      nombre_funcion: ['', Validators.required],
      descripcion: ['', Validators.required],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
    });
  }

  ngOnInit() {
    this.form.patchValue({ ct_modulo_id: this.data?.id_modulo });
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data.id_funcion);
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  loadData(id_funcion?: number) {
    if (id_funcion) {
      this.functionsService.get(id_funcion).subscribe((record) => {
        console.log(record)
        this.form.patchValue({
          ...record.functions,
          ct_usuario_at: this.user.id_usuario,
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.functionsService.add(this.form.value).subscribe(
          {
            next: () => {
              this.modalService.open(FunctionComponent, 'Ver registros', {
                data: { mode: 'view', id_modulo: this.form.value.ct_modulo_id },
              });
            },
            error: (err) => console.error('Error al guardar la función:', err),
          }
        );
        //this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_funcion) {
        this.functionsService.edit(this.data.id_funcion, this.form.value).subscribe(
          {
            next: () => {
              this.modalService.open(FunctionComponent, 'Ver registros', {
                data: { mode: 'view', id_modulo: this.form.value.ct_modulo_id },
              });
            },
            error: (err) => console.error('Error al editar la función:', err),
          }
        );
      }
    }
  }

}
