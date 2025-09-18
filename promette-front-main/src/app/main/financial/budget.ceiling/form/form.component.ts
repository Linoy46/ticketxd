import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';

import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { BudgetService } from '../services/budget.service';
import { AuthLoginService } from '../../../auth/services/auth.login.service';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import {
  Area,
  BudgetCeiling,
  CreateBudgetCeilingDto,
  UpdateBudgetCeilingDto,
} from '../interfaces/budget.interfaces';

interface DropdownItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-budget-ceiling-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    InputGroupModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent implements OnInit, OnDestroy {
  @Input() ceilingData?: BudgetCeiling; // Datos para edición si existe
  @Input() onSave?: (data: any) => void; // Callback después de guardar
  @Input() onCancel?: () => void; // Callback para cancelar
  @Input() isModal: boolean = true; // Por defecto asumimos que está en un modal

  form!: FormGroup;
  areas: Area[] = [];
  isEdit = false;
  loading = false;
  submitting = false;

  // ID del usuario logueado
  currentUserId: number = 0;

  // Items para los dropdowns de PrimeNG
  areasDropdown: DropdownItem[] = [];
  capitulosDropdown: DropdownItem[] = [];
  financiamientosDropdown: DropdownItem[] = [];

  // Suscripciones para manejar apropiadamente
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private alertService: CoreAlertService,
    private authService: AuthLoginService,
    private modalService: CoreModalService
  ) {
    // Obtener los datos pasados directamente al componente a través del modal
    this.modalService.modalState$.subscribe((modalState) => {
      if (modalState && modalState.data) {
        this.ceilingData = modalState.data.ceilingData;
        this.onSave = modalState.data.onSave;
        this.onCancel = modalState.data.onCancel;
      }
    });
  }

  ngOnInit(): void {
    // Obtener el ID del usuario logueado
    this.getCurrentUserId();

    this.initForm();
    this.loadFormData();
    this.isEdit = !!this.ceilingData;

    console.log('FormComponent inicializado, isEdit:', this.isEdit);
    console.log('ceilingData:', this.ceilingData);

    // Si estamos en modo edición, pre-llenamos el formulario
    if (this.isEdit && this.ceilingData) {
      this.populateFormForEdit();
    }
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Obtiene el ID del usuario logueado del servicio de autenticación
   */
  private getCurrentUserId(): void {
    // Verificar si hay un token de autenticación válido
    if (this.authService.isLoggedIn()) {
      // Obtener información del usuario logueado
      this.authService.isLoggedInInfo().subscribe({
        next: (isLoggedIn) => {
          if (isLoggedIn) {
            // Obtener el ID del usuario del estado de Redux (para esto habría que implementar
            // un método en el servicio que devuelva el usuario actual)
            // Por ahora, usamos un ID de ejemplo
            this.currentUserId = 1; // ID del usuario logueado

            // Actualizar el formulario con el ID del usuario
            if (this.form) {
              this.form.patchValue({
                ct_usuario_id: this.currentUserId,
              });
            }
          }
        },
        error: () => {
          this.alertService.error(
            'No se pudo obtener la información del usuario'
          );
        },
      });
    } else {
      // Si no hay sesión, usar un valor predeterminado o mostrar un error
      this.currentUserId = 1; // Valor por defecto
    }
  }

  /**
   * Inicializa el formulario reactivo con validadores
   */
  private initForm(): void {
    this.form = this.fb.group({
      ct_area_id: [null, [Validators.required]],
      ct_capitulo_id: [null, [Validators.required]],
      ct_financiamiento_id: [null, [Validators.required]],
      ct_usuario_id: [this.currentUserId, [Validators.required]], // Campo oculto con valor automático
      cantidad_presupuestada: [0.0, [Validators.required, Validators.min(0)]],
    });

    // Observar cambios en la cantidad presupuestada para asegurar formato con 3 decimales
    this.form.get('cantidad_presupuestada')?.valueChanges.subscribe((value) => {
      if (value !== null && value !== undefined) {
        console.log('Valor actual de cantidad presupuestada:', value);
      }
    });
  }

  /**
   * Carga datos necesarios para el formulario (áreas, capítulos, financiamientos)
   */
  private loadFormData(): void {
    this.loading = true;
    const subscriptionsArray: Subscription[] = [];

    this.budgetService.loadAllAreas();
    this.budgetService.loadAllCapitulos();
    this.budgetService.loadAllFinanciamientos();
    const areaSub = this.budgetService.areas$.subscribe((areas) => {
      console.log('Áreas recibidas en form:', areas);

      if (areas && Array.isArray(areas)) {
        this.areasDropdown = areas
          .filter((area: any) => area.id_area_fin != null && area.nombre)
          .map((area: any) => ({
            label: area.id_financiero
              ? `[${area.id_financiero}] ${area.nombre}`
              : area.nombre,
            value: area.id_area_fin,
          }));

        console.log(
          '✅ Dropdown de áreas procesado:',
          this.areasDropdown.length,
          'áreas'
        );
        console.log('Ejemplo de área:', this.areasDropdown[0]);
      } else {
        console.warn('❌ No se recibieron áreas válidas');
        this.areasDropdown = [];
      }
    });
    subscriptionsArray.push(areaSub);

    // Cargar capítulos
    const capitulosSub = this.budgetService.capitulos$.subscribe(
      (capitulos) => {
        console.log('Datos de capítulos recibidos:', capitulos);
        if (capitulos && capitulos.length > 0) {
          this.capitulosDropdown = capitulos.map((capitulo) => ({
            label: `${capitulo.clave_capitulo} - ${capitulo.nombre_capitulo}`,
            value: capitulo.id_capitulo,
          }));
          console.log(
            'Capítulos procesados para dropdown:',
            this.capitulosDropdown
          );
        } else {
          console.warn('No se recibieron capítulos del servicio');
          this.capitulosDropdown = [];
        }
      }
    );
    subscriptionsArray.push(capitulosSub);

    // Cargar financiamientos
    const financiamientosSub = this.budgetService.financiamientos$.subscribe(
      (financiamientos) => {
        console.log('Datos de financiamientos recibidos:', financiamientos);
        if (financiamientos && financiamientos.length > 0) {
          this.financiamientosDropdown = financiamientos.map(
            (financiamiento) => ({
              label: financiamiento.nombre_financiamiento,
              value: financiamiento.id_financiamiento,
            })
          );
          console.log(
            'Financiamientos procesados para dropdown:',
            this.financiamientosDropdown
          );
        } else {
          console.warn('No se recibieron financiamientos del servicio');
          this.financiamientosDropdown = [];
        }

        // Finalizamos la carga cuando se han procesado los financiamientos
        this.loading = false;
      }
    );
    subscriptionsArray.push(financiamientosSub);

    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
      }
    }, 5000);

    this.subscriptions.push(...subscriptionsArray);
  }

  /**
   * Rellena el formulario con datos existentes (modo edición)
   */
  private populateFormForEdit(): void {
    if (!this.ceilingData) return;

    // ✅ CORRECCIÓN: Asegurar que usamos ct_area_id (que es id_area_fin)
    let areaFinId = this.ceilingData.ct_area_id;

    // Verificación adicional por si viene en la relación
    if (this.ceilingData.ct_area && this.ceilingData.ct_area.id_area_fin) {
      areaFinId = this.ceilingData.ct_area.id_area_fin;
    }

    console.log('Editando techo presupuestal:');
    console.log('- ID techo:', this.ceilingData.id_techo);
    console.log('- ct_area_id (id_area_fin):', areaFinId);
    console.log('- Capítulo ID:', this.ceilingData.ct_capitulo_id);
    console.log('- Financiamiento ID:', this.ceilingData.ct_financiamiento_id);

    this.form.patchValue({
      ct_area_id: areaFinId, // ✅ USAR id_area_fin
      ct_capitulo_id: this.ceilingData.ct_capitulo_id,
      ct_financiamiento_id: this.ceilingData.ct_financiamiento_id,
      cantidad_presupuestada: this.ceilingData.cantidad_presupuestada,
      ct_usuario_id: this.currentUserId,
    });
  }

  /**
   * Calcula el total de todas las cantidades
   */
  calculateTotal(): number {
    // Si estamos en modo edición y tenemos el total del backend, lo usamos
    if (
      this.ceilingData &&
      this.ceilingData.cantidad_presupuestada !== undefined
    ) {
      return this.ceilingData.cantidad_presupuestada;
    }

    // Si no, calculamos según el valor del formulario
    return this.form.get('cantidad_presupuestada')?.value || 0;
  }

  /**
   * Convierte una cantidad a formato de moneda (sin el símbolo $)
   */
  formatCurrency(amount: number): string {
    // Format without the $ symbol, just the number with commas and MXN
    // Use 3 decimal places to match the database schema DECIMAL(15,3)
    return (
      new Intl.NumberFormat('es-MX', {
        style: 'decimal',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(amount) + ' MXN'
    );
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.warning(
        'Por favor complete todos los campos requeridos'
      );
      this.markFormGroupTouched(this.form);
      return;
    }

    this.submitting = true;
    const formData = { ...this.form.value };

    // ✅ VALIDACIÓN CRÍTICA: Asegurar que ct_area_id es un id_area_fin válido
    if (
      formData.ct_area_id === null ||
      formData.ct_area_id === undefined ||
      formData.ct_area_id === '' ||
      isNaN(Number(formData.ct_area_id))
    ) {
      this.alertService.error('Debes seleccionar un área válida');
      this.submitting = false;
      return;
    }

    // ✅ CONVERSIÓN Y VALIDACIÓN FINAL
    formData.ct_area_id = Number(formData.ct_area_id);

    // Verificar que el área seleccionada está en la lista de áreas válidas
    const areaValida = this.areasDropdown.find(
      (a) => a.value === formData.ct_area_id
    );
    if (!areaValida) {
      this.alertService.error('El área seleccionada no es válida');
      this.submitting = false;
      return;
    }

    formData.ct_usuario_id = this.currentUserId;

    if (typeof formData.cantidad_presupuestada === 'number') {
      formData.cantidad_presupuestada = parseFloat(
        formData.cantidad_presupuestada.toFixed(3)
      );
    }

    console.log('=== DATOS FINALES PARA ENVÍO ===');
    console.log('ct_area_id (id_area_fin):', formData.ct_area_id);
    console.log('Tipo:', typeof formData.ct_area_id);
    console.log('Área válida encontrada:', areaValida?.label);
    console.log('Datos completos:', formData);
    console.log('==============================');

    if (this.isEdit && this.ceilingData) {
      const updateData: UpdateBudgetCeilingDto = {
        ...formData,
        id_techo: this.ceilingData.id_techo,
        ct_usuario_at: this.currentUserId,
      };

      this.budgetService
        .updateCeiling(this.ceilingData.id_techo, updateData)
        .subscribe({
          next: (updatedCeiling) => {
            this.alertService.success(
              'Techo presupuestal actualizado exitosamente'
            );
            this.submitting = false;
            if (this.onSave) {
              this.onSave(updatedCeiling);
            }
          },
          error: (err) => {
            this.submitting = false;
            this.alertService.error(
              'Error al actualizar techo presupuestal: ' +
                (err.error?.msg || 'Error desconocido')
            );
          },
        });
    } else {
      const createData: CreateBudgetCeilingDto = {
        ...formData,
        ct_usuario_in: this.currentUserId,
      };

      console.log('=== CREANDO NUEVO TECHO PRESUPUESTAL ===');
      console.log('CreateBudgetCeilingDto:', createData);
      console.log('ct_area_id (debe ser id_area_fin):', createData.ct_area_id);
      console.log('=======================================');

      this.budgetService.createCeiling(createData).subscribe({
        next: (newCeiling) => {
          this.alertService.success('Techo presupuestal creado exitosamente');
          this.submitting = false;
          this.form.reset();
          if (this.onSave) {
            this.onSave(newCeiling);
          }
        },
        error: (err) => {
          this.submitting = false;
          console.error('Error del backend:', err);
          this.alertService.error(
            'Error al crear techo presupuestal: ' +
              (err.error?.msg || 'Error desconocido')
          );
        },
      });
    }
  }

  /**
   * Marca todos los controles de un FormGroup como 'touched'
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Maneja el evento de cancelación
   */
  cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
  }
}
