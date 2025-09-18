import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

// Services and Interfaces
import { InventoriesService } from '../services/inventories.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import {
  Inventario,
  Partida,
  UnidadMedida,
  Factura,
} from '../interfaces/inventories.interface';

// Definición de interface para los elementos del dropdown de PrimeNG
interface PrimeNGDropdownItem {
  label: string;
  value: number;
}

/**
 * Componente para crear y editar elementos de inventario
 * Funciona tanto de forma independiente como dentro de un modal
 */
@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent implements OnInit, OnDestroy {
  /**
   * Elemento de inventario para editar (cuando se usa en un modal)
   */
  @Input() inventoryItem: Inventario | null = null;

  /**
   * Indica si el componente se está utilizando dentro de un modal
   */
  @Input() isModal = false;

  /**
   * Función de callback cuando se guarda exitosamente
   */
  @Input() saveSuccess!: (item: Inventario) => void;

  /**
   * Función de callback para cancelar
   */
  @Input() cancel!: () => void;

  /**
   * Función de callback para cerrar el modal
   */
  @Input() close!: () => void;

  /**
   * Indica si el componente se está utilizando para reponer stock
   */
  @Input() isStockReplenishment: boolean = false;

  /**
   * Formulario reactivo para gestionar los datos
   */
  inventoryForm!: FormGroup;

  /**
   * Indica si estamos en modo edición
   */
  editMode = false;

  /**
   * ID del inventario que se está editando (si aplica)
   */
  inventoryId: number | null = null;

  // Datos para los menús desplegables
  partidas: PrimeNGDropdownItem[] = [];
  unidades: PrimeNGDropdownItem[] = [];
  facturas: PrimeNGDropdownItem[] = [];

  // Indicadores de estado
  loading = false;
  submitting = false;

  // Mensaje de estado del stock
  statusMessage: string = '';

  // Subject para gestionar la finalización de observables
  private destroy$ = new Subject<void>();
  form: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoriesService: InventoriesService,
    private alertService: CoreAlertService,
    public loadingService: CoreLoadingService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRelatedData();

    // Si estamos en un modal y tenemos un item de inventario
    if (this.isModal && this.inventoryItem) {
      this.editMode = true;
      this.inventoryId = this.inventoryItem.id_inventario;
      this.populateFormWithItem(this.inventoryItem);
    } else {
      // Modo normal a través de la URL
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.editMode = true;
          this.inventoryId = +id;
          this.loadInventoryItem(+id);
        }
      });
    }

    // Si estamos en modo reposición de stock
    if (this.isStockReplenishment && this.inventoryItem) {
      this.setStockReplenishmentMode();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario reactivo con sus validaciones
   */
  initForm(): void {
    this.inventoryForm = this.fb.group({
      folio: ['', Validators.required],
      descripcion: ['', Validators.required],
      observaciones: ['', [Validators.maxLength(255)]], // Campo opcional con límite de caracteres
      cantidad: [1, [Validators.required, Validators.min(1)]],
      ct_partida_id: [null, Validators.required],
      ct_unidad_id: [null, Validators.required],
      ct_factura_id: [null, Validators.required],
      replenishQuantity: [0, Validators.min(0)],
      fecha: [null, Validators.required] // Nuevo campo para la fecha
    });
  }

  /**
   * Carga los datos del item en el formulario cuando se usa en un modal
   * @param item Item de inventario a editar
   */
  populateFormWithItem(item: Inventario): void {
    this.loading = true;

    if (!item) {
      this.alertService.error('Error', 'No se pudieron cargar los datos');
      this.loading = false;
      return;
    }

    // Convertir la fecha a un objeto Date si es una cadena
    const fecha = item.createdAt || item.fecha_in;
    const fechaDate = fecha ? new Date(fecha) : null;

    this.inventoryForm.patchValue({
      folio: item.folio,
      descripcion: item.descripcion || item.description || '',
      observaciones: item.observaciones || '',
      cantidad: item.cantidad,
      ct_partida_id: item.ct_partida_id || item.id_partida || 0,
      ct_unidad_id: item.ct_unidad_id || item.id_unidad_medida || 0,
      ct_factura_id: item.ct_factura_id || item.id_factura || 0,
      fecha: fechaDate // Asignar la fecha convertida
    });

    this.loading = false;
  }

  /**
   * Configura el formulario para el modo de reposición de stock
   */
  setStockReplenishmentMode(): void {
    if (!this.inventoryItem) return;

    // Obtener la cantidad actual y restante
    const currentQuantity = this.inventoryItem.cantidad || 0;
    const remainingQuantity = this.inventoryItem.resta || 0;
    const usedQuantity = currentQuantity - remainingQuantity;

    // Preconfigurar el formulario
    this.inventoryForm.patchValue({
      id_inventario: this.inventoryItem.id_inventario,
      folio: this.inventoryItem.folio,
      descripcion:
        this.inventoryItem.descripcion || this.inventoryItem.description,
      cantidad: currentQuantity,
      replenishQuantity: 0,
      ct_partida_id:
        this.inventoryItem.ct_partida_id || this.inventoryItem.id_partida,
      ct_unidad_id:
        this.inventoryItem.ct_unidad_id || this.inventoryItem.id_unidad_medida,
      ct_factura_id:
        this.inventoryItem.ct_factura_id || this.inventoryItem.id_factura,
    });

    // Desactivar campos que no deberían modificarse en modo reposición
    this.inventoryForm.get('folio')?.disable();
    this.inventoryForm.get('descripcion')?.disable();
    this.inventoryForm.get('ct_partida_id')?.disable();
    this.inventoryForm.get('ct_unidad_id')?.disable();
    this.inventoryForm.get('ct_factura_id')?.disable();

    // Mostrar información adicional sobre el stock
    this.statusMessage = `Stock actual: ${remainingQuantity} de ${currentQuantity} unidades (${usedQuantity} utilizadas)`;
  }

  /**
   * Carga los datos relacionados para los menús desplegables
   */
  loadRelatedData(): void {
    this.loading = true;

    // Llamadas paralelas para obtener datos
    forkJoin({
      partidas: this.inventoriesService.getPartidas(),
      unidades: this.inventoriesService.getUnidadesMedida(),
      facturas: this.inventoriesService.getFacturas(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Transformar partidas para dropdown de PrimeNG
          this.partidas = data.partidas.map((p: Partida) => ({
            label: `${p.clave} - ${p.nombre}`,
            value: p.id_partida,
          }));

          // Transformar unidades para dropdown de PrimeNG
          this.unidades = data.unidades.map((u: UnidadMedida) => ({
            label: u.clave + (u.nombre_unidad ? ` - ${u.nombre_unidad}` : ''),
            value: u.id_unidad || u.id_unidad_medida || 0,
          }));

          // Transformar facturas para dropdown de PrimeNG
          this.facturas = data.facturas.map((f: Factura) => ({
            label: f.factura,
            value: f.id_factura,
          }));

          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.alertService.error(
            'Error',
            'No se pudieron cargar los datos relacionados'
          );
          console.error('Error cargando datos relacionados:', error);
        },
      });
  }

  /**
   * Carga un elemento de inventario por su ID
   * @param id ID del elemento a cargar
   */
  loadInventoryItem(id: number): void {
    this.loading = true;
    this.inventoriesService
      .getInventarioById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (item) => {
          this.inventoryForm.patchValue({
            folio: item.folio,
            descripcion: item.descripcion || item.description || '',
            observaciones: item.observaciones || '',
            cantidad: item.cantidad,
            ct_partida_id: item.ct_partida_id || item.id_partida || 0,
            ct_unidad_id: item.ct_unidad_id || item.id_unidad_medida || 0,
            ct_factura_id: item.ct_factura_id || item.id_factura || 0,
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.alertService.error('Error', 'No se pudo cargar el elemento');
          this.router.navigate(['/promette/inventory']);
        },
      });
  }

  /**
   * Maneja la replenishQuantity antes del envío
   */
  handleStockReplenishment() {
    if (!this.isStockReplenishment) return true;

    // Cantidad a reponer
    const replenishQty = Number(
      this.inventoryForm.get('replenishQuantity')?.value || 0
    );

    if (replenishQty <= 0) {
      this.alertService.warning(
        'Debe ingresar una cantidad mayor a cero para reponer el stock'
      );
      return false;
    }

    // Aumentar la cantidad total para ajustar el stock
    const currentQty = Number(this.inventoryForm.get('cantidad')?.value || 0);
    this.inventoryForm.patchValue({
      cantidad: currentQty + replenishQty,
    });

    return true;
  }

  /**
   * Procesa el envío del formulario (crear o actualizar)
   */
  onSubmit(): void {
    if (this.inventoryForm.invalid) {
      Object.keys(this.inventoryForm.controls).forEach((key) => {
        this.inventoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Manejo especial para reposición de stock
    if (this.isStockReplenishment) {
      if (!this.handleStockReplenishment()) {
        return;
      }
    }

    this.submitting = true;
    const formData = this.inventoryForm.getRawValue(); // Usar getRawValue para obtener valores de campos deshabilitados

    if (this.editMode && this.inventoryId) {
      this.inventoriesService
        .updateInventario(this.inventoryId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.submitting = false;
            this.alertService.success(
              'Éxito',
              'Inventario actualizado correctamente'
            );

            // Si estamos en un modal, llamar directamente a la función
            if (this.isModal && this.saveSuccess) {
              this.saveSuccess(result);
            } else {
              // Navegación normal si no estamos en un modal
              this.router.navigate(['/promette/inventory']);
            }
          },
          error: () => {
            this.submitting = false;
          },
        });
    } else {
      this.inventoriesService
        .createInventario(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.submitting = false;
            this.alertService.success(
              'Éxito',
              'Inventario creado correctamente'
            );

            if (this.isModal && this.saveSuccess) {
              this.saveSuccess(result);
            } else {
              this.router.navigate(['/promette/inventory']);
            }
          },
          error: () => {
            this.submitting = false;
          },
        });
    }
  }

  /**
   * Maneja la acción de cancelar
   */
  onCancel(): void {
    if (this.isModal) {
      // Llamar directamente a close o cancel si están disponibles
      if (typeof this.close === 'function') {
        this.close();
      } else if (typeof this.cancel === 'function') {
        this.cancel();
      }
    } else {
      this.router.navigate(['/promette/inventory']);
    }
  }
}
