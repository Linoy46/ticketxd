import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

// Services
import {
  AreasService,
  Direccion,
  Departamento,
  Area,
} from '../services/areas.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';

interface DropdownItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-add-area-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
  ],
  templateUrl: './add-area-modal.component.html',
  styleUrls: ['./add-area-modal.component.scss'],
})
export class AddAreaModalComponent implements OnInit, OnDestroy {
  @Input() onAreaCreated!: (area: Area) => void;
  @Input() onCancel!: () => void;

  areaForm!: FormGroup;
  direcciones: DropdownItem[] = [];
  departamentos: DropdownItem[] = [];

  loading = false;
  submitting = false;
  loadingDepartamentos = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private areasService: AreasService,
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDirecciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    this.areaForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      direccionId: [null, Validators.required],
      departamentoId: [null, Validators.required],
    });

    // Escuchar cambios en la dirección para cargar departamentos
    this.areaForm
      .get('direccionId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((direccionId: number) => {
        if (direccionId) {
          this.loadDepartamentos(direccionId);
          // Limpiar departamento seleccionado cuando cambia la dirección
          this.areaForm.get('departamentoId')?.setValue(null);
        } else {
          this.departamentos = [];
          this.areaForm.get('departamentoId')?.setValue(null);
        }
      });
  }

  /**
   * Carga todas las direcciones disponibles
   */
  private loadDirecciones(): void {
    this.loading = true;
    this.areasService
      .getDirecciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (direcciones: Direccion[]) => {
          this.direcciones = direcciones.map((dir) => ({
            label: dir.nombre,
            value: dir.id_direccion,
          }));
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error cargando direcciones:', error);
        },
      });
  }

  /**
   * Carga los departamentos de una dirección específica
   */
  private loadDepartamentos(direccionId: number): void {
    this.loadingDepartamentos = true;
    this.departamentos = [];

    this.areasService
      .getDepartamentosByDireccion(direccionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departamentos: Departamento[]) => {
          if (departamentos && departamentos.length > 0) {
            this.departamentos = departamentos.map((dept) => ({
              label: dept.nombre,
              value: dept.id_departamento,
            }));
          } else {
            this.departamentos = [];
          }

          this.loadingDepartamentos = false;
          // Forzar detección de cambios
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loadingDepartamentos = false;
          console.error('Error cargando departamentos:', error);
          this.alertService.error('Error al cargar los departamentos');
        },
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.areaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData = this.areaForm.value;

    const areaData = {
      nombre: formData.nombre.trim(),
      id_departamento: formData.departamentoId,
    };

    this.areasService
      .createArea(areaData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newArea: Area) => {
          this.submitting = false;
          if (this.onAreaCreated) {
            this.onAreaCreated(newArea);
          }
        },
        error: (error) => {
          this.submitting = false;
          console.error('Error creando área:', error);
        },
      });
  }

  /**
   * Maneja la cancelación del formulario
   */
  onCancelClick(): void {
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.areaForm.controls).forEach((key) => {
      const control = this.areaForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.areaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.areaForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${
          field.errors['minlength'].requiredLength
        } caracteres`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${
          field.errors['maxlength'].requiredLength
        } caracteres`;
      }
    }
    return '';
  }

  /**
   * Obtiene la etiqueta amigable para un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre del área',
      direccionId: 'La dirección',
      departamentoId: 'El departamento',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Obtiene el nombre de la dirección seleccionada para mostrar en la jerarquía
   */
  getDireccionLabel(): string {
    const direccionId = this.areaForm.get('direccionId')?.value;
    const direccion = this.direcciones.find((d) => d.value === direccionId);
    return direccion ? direccion.label : '';
  }

  /**
   * Obtiene el nombre del departamento seleccionado para mostrar en la jerarquía
   */
  getDepartamentoLabel(): string {
    const departamentoId = this.areaForm.get('departamentoId')?.value;
    const departamento = this.departamentos.find(
      (d) => d.value === departamentoId
    );
    return departamento ? departamento.label : '';
  }
}
