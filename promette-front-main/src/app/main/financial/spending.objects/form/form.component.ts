import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Capitulo, Concepto } from '../interfaces/spending.interface';
import { CoreModalService } from '../../../../core/services/core.modal.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-body">
      <form [formGroup]="form">
        <!-- Fields for Chapter form -->
        <ng-container *ngIf="type === 'chapter'">
          <div class="mb-3">
            <label for="clave_capitulo" class="form-label">Clave Capítulo</label>
            <input type="number" class="form-control" id="clave_capitulo"
                  formControlName="clave_capitulo">
            <div *ngIf="form.get('clave_capitulo')?.invalid && form.get('clave_capitulo')?.touched"
                  class="text-danger">
              La clave del capítulo es requerida
            </div>
          </div>
          <div class="mb-3">
            <label for="nombre_capitulo" class="form-label">Nombre Capítulo</label>
            <input type="text" class="form-control" id="nombre_capitulo"
                  formControlName="nombre_capitulo">
            <div *ngIf="form.get('nombre_capitulo')?.invalid && form.get('nombre_capitulo')?.touched"
                  class="text-danger">
              El nombre del capítulo es requerido
            </div>
          </div>
        </ng-container>

        <!-- Fields for Item form -->
        <ng-container *ngIf="type === 'item'">
          <div class="mb-3">
            <label for="ct_capitulo_id" class="form-label">Capítulo</label>
            <select class="form-select" id="ct_capitulo_id" formControlName="ct_capitulo_id">
              <option [ngValue]="null">Seleccione un capítulo</option>
              <option *ngFor="let chapter of chapters" [ngValue]="chapter.id">
                {{ chapter.clave_capitulo }} - {{ chapter.nombre_capitulo }}
              </option>
            </select>
            <div *ngIf="form.get('ct_capitulo_id')?.invalid && form.get('ct_capitulo_id')?.touched"
                  class="text-danger">
              El capítulo es requerido
            </div>
          </div>
          <div class="mb-3">
            <label for="clave_partida" class="form-label">Clave Partida</label>
            <input type="text" class="form-control" id="clave_partida"
                  formControlName="clave_partida">
            <div *ngIf="form.get('clave_partida')?.invalid && form.get('clave_partida')?.touched"
                  class="text-danger">
              La clave de la partida es requerida (máx. 10 caracteres)
            </div>
          </div>
          <div class="mb-3">
            <label for="nombre_partida" class="form-label">Nombre Partida</label>
            <input type="text" class="form-control" id="nombre_partida"
                  formControlName="nombre_partida">
            <div *ngIf="form.get('nombre_partida')?.invalid && form.get('nombre_partida')?.touched"
                  class="text-danger">
              El nombre de la partida es requerido
            </div>
          </div>
        </ng-container>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="close()">Cancelar</button>
      <button type="button" class="btn btn-primary" (click)="save()"
              [disabled]="form.invalid">Guardar</button>
    </div>
  `
})
export class FormComponent implements OnInit {
  form!: FormGroup;
  item: Capitulo | Concepto = {} as any;
  type: 'chapter' | 'item' = 'item';
  chapters: Capitulo[] = [];
  onSave?: Function;

  constructor(
    private fb: FormBuilder,
    private modalService: CoreModalService
  ) {
    // Default objects that satisfy the type requirements
    const defaultCapitulo: Capitulo = {
      id_capitulo: 0,
      clave_capitulo: 0,
      nombre_capitulo: '',
      estado: 1
    };

    const defaultConcepto: Concepto = {
      id_partida: 0,
      ct_capitulo_id: 0,
      clave_partida: '',
      nombre_partida: '',
      estado: 1
    };

    // Obtener los datos del modal
    const modalState = this.modalService.getCurrentModalState();

    if (modalState && modalState.data) {
      // Use the appropriate default based on the type
      this.item = modalState.data.item ||
        (modalState.data.type === 'chapter' ? defaultCapitulo : defaultConcepto);
      this.type = modalState.data.type || 'item';
      this.chapters = modalState.data.chapters || [];
      this.onSave = modalState.data.onSave;
    } else {
      // If no modal data, use 'item' as default type and set appropriate default object
      this.item = this.type === 'chapter' ? defaultCapitulo : defaultConcepto;
    }

    console.log('FormComponent inicializado con:', {
      type: this.type,
      item: this.item,
      chaptersCount: this.chapters.length
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    if (this.type === 'chapter') {
      const chapter = this.item as Capitulo;
      this.form = this.fb.group({
        clave_capitulo: [chapter.clave_capitulo || '', [Validators.required]],
        nombre_capitulo: [chapter.nombre_capitulo || '', [Validators.required, Validators.maxLength(100)]]
      });
    } else if (this.type === 'item') {
      const item = this.item as Concepto;
      this.form = this.fb.group({
        ct_capitulo_id: [item.ct_capitulo_id || null, [Validators.required]],
        clave_partida: [item.clave_partida || '', [Validators.required, Validators.maxLength(10)]],
        nombre_partida: [item.nombre_partida || '', [Validators.required, Validators.maxLength(255)]]
      });
    }
  }

  save(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = { ...this.item, ...formValue };

      if (this.onSave) {
        this.onSave(result);
      } else {
        console.warn('No se proporcionó una función onSave');
        this.close();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  close(): void {
    this.modalService.close();
  }
}
