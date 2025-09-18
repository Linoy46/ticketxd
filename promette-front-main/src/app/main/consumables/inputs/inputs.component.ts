import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputsService } from './services/inputs.service';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import {
  DropdownItem,
  Partida,
  UnidadMedida,
  Factura,
  Proveedor,
} from './interfaces/inputs.interface';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
// import { InputsConfirmationComponent } from './confirmation/confirmation.component';
import { SharedLoadingComponent } from '../../../shared/shared-loading/shared-loading.component';

import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

@Component({
  selector: 'app-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    CalendarModule,
    RadioButtonModule,
    PaginatorModule,
    SelectButtonModule,
    SharedCustomModalComponent,
    SharedLoadingComponent,
    TutorialComponent,
  ],
  providers: [InputsService],
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.scss'],
})
export class InputsComponent implements OnInit, OnDestroy {
  entryForm!: FormGroup;
  partidas: DropdownItem[] = [];
  units: DropdownItem[] = [];
  loading: boolean = false;
  submitting: boolean = false;
  private destroy$ = new Subject<void>();

  // Arreglo para almacenar múltiples productos para guardar
  productQueue: any[] = [];

  // Límite máximo de elementos en cola
  readonly MAX_QUEUE_SIZE = 10;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Formulario de entrada',
        element: '#formulario',
        intro:
          'Formulario par aregistrar los datos de la nueva entrada a registrar.',
        position: 'left',
      },
      {
        title: 'Botón de agregar',
        element: '#nuevo',
        intro:
          'Agrega el producto a la fila de nuevas entradas.<br> <small style="color: #999;">(Se activa cuando completes los campos)</small>',
        position: 'left',
      },
      {
        title: 'Botón de cancelar',
        element: '#cancelar',
        intro: 'Cancela la petición de agregar.',
        position: 'right',
      },
      {
        title: 'Resgistrada entrada',
        element: '#agregar',
        intro:
          'Registra los productos agregados a la tabla de inventarios. <br> <small style="color: #999;">(Se activa cuando agregas un registro)</small>',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en unidades');
    },
    onExit: () => {
      console.log('Tutorial cerrado en unidades');
    },
  };

  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  get user() {
    return this.userSelector();
  }

  constructor(
    private fb: FormBuilder,
    private inputsService: InputsService,
    private alertService: CoreAlertService,
    private modalService: CoreModalService,
    private loadingService: CoreLoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa el componente, configurando el formulario y cargando los datos iniciales
   */
  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  /**
   * Limpia las suscripciones cuando se destruye el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  /**
   * Inicializa el formulario de entrada con sus validadores
   */
  private initForm(): void {
    this.entryForm = this.fb.group({
      // Eliminamos el campo folio
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
      observaciones: ['', [Validators.maxLength(255)]], // Campo opcional con límite de caracteres
      ct_partida_id: [null, Validators.required],
      ct_unidad_id: [null, Validators.required],
      factura: ['', Validators.required],
      razon_social: ['', Validators.required],
      entryDate: [new Date(), Validators.required],
    });
  }
  /**
   * Carga los datos iniciales necesarios para el formulario
   */
  private loadInitialData(): void {
    this.loadingService.show();
    // Ya no es necesario cargar el folio del servidor
    this.loadDropdownData();
  }
  /**
   * Carga las partidas y unidades de medida para los desplegables
   */
  private loadDropdownData(): void {
    this.loading = true;

    this.inputsService
      .getFormDataSimplified()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({
          partidas,
          unidades,
        }: {
          partidas: Partida[];
          unidades: UnidadMedida[];
        }) => {
          if (Array.isArray(partidas) && partidas.length > 0) {
            this.partidas = partidas.map((p: Partida) => {
              return {
                id: p.id_partida || 0,
                name: p.nombre_partida || '',
                code: p.clave_partida || '',
              };
            });
            this.cdr.detectChanges();
          } else {
            this.partidas = [];
          }

          if (Array.isArray(unidades) && unidades.length > 0) {
            this.units = unidades.map((u: UnidadMedida) => ({
              id: u.id_unidad || 0,
              name: u.nombre_unidad || '',
              code: u.clave_unidad || '',
            }));
          } else {
            this.units = [];
          }

          this.loading = false;
          this.loadingService.hide();
        },
        error: () => {
          this.loading = false;
          this.loadingService.hide();
          this.alertService.error('Error al cargar datos para los campos');
          this.partidas = [];
          this.units = [];
        },
      });
  }
  /**
   * Retorna información detallada de una partida basada en su ID
   * @param partidaId ID de la partida
   * @returns Información de la partida en formato string
   */
  getPartidaInfo(partidaId: number): string {
    if (!partidaId) return 'No seleccionada';

    const partida = this.partidas.find((p) => p.id === partidaId);
    if (!partida) return `ID: ${partidaId} (No encontrada)`;

    return `${partida.code} - ${partida.name}`;
  }
  /**
   * Agrega un elemento al lote de entradas para procesamiento
   */
  addToQueue(): void {
    if (this.entryForm.invalid) {
      this.markFormGroupTouched(this.entryForm);
      this.alertService.warning(
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    if (this.productQueue.length >= this.MAX_QUEUE_SIZE) {
      this.alertService.warning(
        `No se pueden agregar más de ${this.MAX_QUEUE_SIZE} productos a la vez`
      );
      return;
    }

    const formData = this.entryForm.value;
    const partidaSelected = this.partidas.find(
      (p) => p.id === formData.ct_partida_id
    );
    const unitSelected = this.units.find((u) => u.id === formData.ct_unidad_id);

    this.productQueue.push({
      descripcion: formData.descripcion,
      observaciones: formData.observaciones || '',
      cantidad: formData.cantidad,
      ct_partida_id: formData.ct_partida_id,
      ct_unidad_id: formData.ct_unidad_id,
      proveedor: formData.razon_social,
      facturaNum: formData.factura,
      razon_social: formData.razon_social,
      factura: formData.factura,
      displayData: {
        partidaName: partidaSelected
          ? `${partidaSelected.code} - ${partidaSelected.name}`
          : 'No seleccionada',
        unitName: unitSelected ? unitSelected.name : 'No seleccionada',
      },
    });

    this.alertService.success(
      'Producto agregado a la cola',
      `Productos en cola: ${this.productQueue.length}`
    );
    this.entryForm.patchValue({
      descripcion: '',
      observaciones: '',
      cantidad: 1,
    });
  }

  /**
   * Elimina un elemento de la cola de productos
   * @param index Índice del elemento a eliminar
   */
  removeFromQueue(index: number): void {
    if (index >= 0 && index < this.productQueue.length) {
      this.productQueue.splice(index, 1);
      this.alertService.success(
        'Elemento eliminado',
        `Quedan ${this.productQueue.length} elementos en cola`
      );
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSubmit(): void {
    if (this.productQueue.length > 0) {
      this.submitBatchProducts();
      return;
    }
    if (this.entryForm.invalid) {
      this.markFormGroupTouched(this.entryForm);
      this.alertService.warning(
        'Por favor complete todos los campos requeridos'
      );
      return;
    }
    this.alertService
      .confirm('¿Está seguro de registrar esta entrada?', 'Confirmar registro')
      .then((result) => {
        if (result.isConfirmed) {
          this.submitForm();
        }
      });
  }
  /**
   * Submit batch products - eliminadas validaciones de folios duplicados
   */
  private submitBatchProducts(): void {
    // Verificación adicional de integridad de la cola antes de procesar
    if (this.productQueue.length === 0) {
      this.alertService.warning('No hay productos en la cola para registrar');
      return;
    }

    // Crear una copia segura de la cola
    const queueSnapshot = [...this.productQueue];
    console.log(
      `Iniciando procesamiento de lote con ${queueSnapshot.length} elementos`
    );

    // Eliminamos la verificación de folios duplicados que ya no es necesaria

    this.alertService
      .confirm(
        `¿Está seguro de registrar ${queueSnapshot.length} productos?`,
        'Confirmar registro múltiple'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.submitting = true;
          this.loadingService.show();
          this.processBatchItems();
        }
      });
  }
  private processBatchItems(): void {
    if (this.productQueue.length === 0) {
      this.submitting = false;
      this.loadingService.hide();
      this.alertService.warning('No hay productos en la cola para registrar');
      return;
    }

    this.submitting = true;
    this.loadingService.show();

    console.log(
      `Iniciando proceso de registro para ${this.productQueue.length} elementos`
    );

    const groupedItems = this.groupItemsByProviderAndInvoice(this.productQueue);
    console.log(
      `Items agrupados en ${Object.keys(groupedItems).length} grupos distintos`
    );

    const processingPromises: Promise<any>[] = [];
    for (const key in groupedItems) {
      const group = groupedItems[key];
      if (group && group.length > 0) {
        processingPromises.push(this.processGroupItems(group));
      }
    }
    Promise.all(processingPromises)
      .then((results) => {
        const successCount = results.reduce(
          (sum, result) => sum + (result?.success || 0),
          0
        );
        const failCount = results.reduce(
          (sum, result) => sum + (result?.failed || 0),
          0
        );

        this.submitting = false;
        this.loadingService.hide();

        if (successCount > 0) {
          this.alertService.success(
            `${successCount} productos registrados correctamente`
          );
        }

        if (failCount > 0) {
          this.alertService.warning(
            `${failCount} productos no pudieron ser registrados.`,
            'Algunos elementos no se registraron'
          );
        }
        this.productQueue = [];
        this.resetForm();
      })
      .catch((error) => {
        this.submitting = false;
        this.loadingService.hide();
        console.error('Error en el procesamiento por grupos:', error);
        this.alertService.error('Ocurrió un error al procesar los productos');
      });
  }
  private groupItemsByProviderAndInvoice(items: any[]): {
    [key: string]: any[];
  } {
    const groups: { [key: string]: any[] } = {};

    items.forEach((item) => {
      const key = `${item.razon_social}_${item.factura}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return groups;
  }
  /**
   * Procesa elementos agrupados para enviarlos al servidor
   * @param items Array de elementos a procesar
   * @returns Promesa con resultado del procesamiento
   */
  private processGroupItems(
    items: any[]
  ): Promise<{ success: number; failed: number }> {
    return new Promise((resolve, reject) => {
      if (!items || items.length === 0) {
        resolve({ success: 0, failed: 0 });
        return;
      }

      // Verificar integridad de los items antes de procesarlos
      const itemsToProcess = [...items].map((item) => {
        const { displayData, folio, displayFolio, ...dataToSend } = item;
        return dataToSend;
      });

      const firstItem = itemsToProcess[0];
      const proveedorData = {
        razon_social: firstItem.razon_social,
      };

      this.inputsService
        .createProveedor(proveedorData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (proveedor: Proveedor) => {
            const facturaData = {
              factura: firstItem.factura,
              ct_provedor_id: proveedor.id_proveedor,
            };

            this.inputsService
              .createFactura(facturaData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (factura: Factura) => {
                  try {
                    const inventoryItems = items.map((item) => {
                      return {
                        descripcion: item.descripcion || 'Sin descripción',
                        observaciones: item.observaciones || '',
                        cantidad: item.cantidad || 1,
                        ct_partida_id: item.ct_partida_id,
                        ct_unidad_id: item.ct_unidad_id,
                        ct_factura_id: factura.id_factura,
                      };
                    });

                    this.inputsService
                      .createMultipleInventario(inventoryItems)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe({
                        next: (response) => {
                          if (response && response.success) {
                            resolve({
                              success: response.createdItems?.length || 0,
                              failed: response.errors?.length || 0,
                            });
                          } else {
                            resolve({
                              success: 0,
                              failed: items.length,
                            });
                          }
                        },
                        error: (error) => {
                          resolve({ success: 0, failed: items.length });
                        },
                      });
                  } catch (error) {
                    resolve({ success: 0, failed: items.length });
                  }
                },
                error: (error) => {
                  if (
                    error.status === 400 &&
                    error.error?.msg?.includes('Ya existe')
                  ) {
                    this.alertService.warning(
                      'Ya existe una factura con este número para este proveedor'
                    );
                  }
                  resolve({ success: 0, failed: items.length });
                },
              });
          },
          error: (error) => {
            let errorMsg = 'Error al crear el proveedor';
            if (error.status === 400) {
              errorMsg = error.error?.msg || errorMsg;
            }
            this.alertService.error(errorMsg);
            resolve({ success: 0, failed: items.length });
          },
        });
    });
  }

  private submitForm(): void {
    this.submitting = true;
    this.loadingService.show();

    const formValues = this.entryForm.value;

    const proveedorData = {
      razon_social: formValues.razon_social,
    };

    this.inputsService
      .createProveedor(proveedorData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proveedor: Proveedor) => {
          const facturaData = {
            factura: formValues.factura,
            ct_provedor_id: proveedor.id_proveedor,
          };

          this.inputsService
            .createFactura(facturaData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (factura: Factura) => {
                const inventarioData = {
                  // Ya no enviamos folio
                  descripcion: formValues.descripcion,
                  observaciones: formValues.observaciones || '',
                  cantidad: formValues.cantidad,
                  ct_partida_id: formValues.ct_partida_id,
                  ct_unidad_id: formValues.ct_unidad_id,
                  ct_factura_id: factura.id_factura,
                };

                this.inputsService
                  .createInventario(inventarioData)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      this.submitting = false;
                      this.loadingService.hide();
                      this.alertService.success(
                        'Entrada de inventario registrada correctamente'
                      );
                      this.resetForm();
                    },
                    error: () => {
                      this.submitting = false;
                      this.loadingService.hide();
                      console.error('Error creating inventory entry:');
                      this.alertService.error('Error al registrar la entrada');
                    },
                  });
              },
              error: () => {
                this.submitting = false;
                this.loadingService.hide();
                console.error('Error al crear la factura');
                this.alertService.error('Error al crear la factura');
              },
            });
        },
        error: () => {
          this.submitting = false;
          this.loadingService.hide();
          console.error('Error al crear el proveedor');
          this.alertService.error('Error al crear el proveedor');
        },
      });
  }
  private resetForm(): void {
    this.entryForm.reset({
      cantidad: 1,
      entryDate: new Date(),
    });
    // Ya no necesitamos cargar un nuevo folio
  }
  handleCancel(): void {
    if (this.productQueue.length > 0) {
      this.alertService
        .confirm(
          `Hay ${this.productQueue.length} productos en cola. ¿Está seguro de cancelar?`,
          'Confirmar cancelación'
        )
        .then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/promette/inventories']);
          }
        });
    } else {
      this.router.navigate(['/promette/inventories']);
    }
  }
}
