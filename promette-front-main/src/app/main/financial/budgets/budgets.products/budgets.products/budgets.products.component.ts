import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BudgetsProductsService } from '../services/budgets.products.service';
import {
  Area,
  BudgetItem,
  ConsumableProduct,
  Item,
  ProjectAnnual,
} from '../../interfaces/budgets.interface';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, firstValueFrom, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthLoginService } from '../../../../auth/services/auth.login.service';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';
import { ActivatedRoute } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

interface MonthlyQuantity {
  mes: number;
  nombre: string;
  cantidad: number;
}

interface ProductSelection {
  tempId: string;
  product: ConsumableProduct;
  monthlyQuantities: MonthlyQuantity[];
  totalQuantity: number;
}

interface DropdownItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-budgets-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
    ToastModule,
  ],
  providers: [MessageService, BudgetsProductsService],
  templateUrl: './budgets.products.component.html',
  styleUrls: ['./budgets.products.component.scss'],
})
export class BudgetsProductsComponent implements OnInit, OnDestroy {
  [x: string]: any;
  budgetItem: BudgetItem | null = null;
  close?: () => void;

  // Hacer Math accesible en la plantilla
  Math = Math;

  loading = false;
  submitting = false;
  isSubmitting = false;
  error: string | null = null;
  success: string | null = null;

  areasOriginal: Area[] = [];
  itemsOriginal: Item[] = [];
  productsOriginal: ConsumableProduct[] = [];

  areas: DropdownItem[] = [];
  items: DropdownItem[] = [];
  products: DropdownItem[] = [];

  selectedProducts: ProductSelection[] = [];
  selectedItemId: number | null = null;
  selectedProduct: ConsumableProduct | null = null;

  requisitionForm: FormGroup;

  private destroy$ = new Subject<void>();

  monthNames: string[] = [];
  currentUserId: number | null = null;

  monthlyQuantities: MonthlyQuantity[] = [];
  totalQuantity = 0;
  isEditing = false;
  editingProductId: string | null = null; // Propiedades para el control presupuestal reactivo
  originalMontoAsignado: number = 0; // Monto asignado original del presupuesto
  originalMontoUtilizado: number = 0; // Monto utilizado original del presupuesto
  currentRequisitionTotal: number = 0; // Total actual de la requisición en curso

  // Nueva propiedad para controlar el modo de renderizado
  isReactiveMode: boolean = false; // false = renderizado desde BD, true = renderizado reactivo

  // Propiedades reactivas calculadas con modo dual
  get montoUtilizadoDisplay(): number {
    return this.isReactiveMode
      ? this.originalMontoUtilizado + this.currentRequisitionTotal
      : this.proyectoAnual?.monto_utilizado || 0;
  }

  get montoDisponibleDisplay(): number {
    if (this.isReactiveMode) {
      return this.originalMontoAsignado - this.originalMontoUtilizado - this.currentRequisitionTotal;
    }
    return this.proyectoAnual?.monto_disponible || (this.originalMontoAsignado - this.originalMontoUtilizado);
  }

  get simulatedMontoDisponible(): number {
    return (
      this.originalMontoAsignado -
      this.originalMontoUtilizado -
      this.currentRequisitionTotal
    );
  }

  get exceedsAvailableBudget(): boolean {
    return this.montoDisponibleDisplay < 0;
  }

  get showBudgetWarning(): boolean {
    return this.isReactiveMode && this.currentRequisitionTotal > 0 && this.montoDisponibleDisplay < this.currentRequisitionTotal;
  }

  // Getter para obtener el nombre del área desde la relación del proyecto anual
  get currentAreaName(): string {
    if (
      this.proyectoAnual?.dt_techo?.rl_area_financiero?.ct_area?.nombre_area
    ) {
      return this.proyectoAnual.dt_techo.rl_area_financiero.ct_area.nombre_area;
    }
    // Fallback al valor original si no está disponible la relación
    return this.budgetItem?.unidad || 'Área no disponible';
  }

  // Variables para manejar la descripción del proyecto
  proyectoAnual: ProjectAnnual | null = null;
  descripcionProyecto: string = '';
  apiBaseUrl = environment.apiUrlPromette;
  techoDetallado: any = null;

  private capituloActual: number | null = null;
  private idArea: number = 0;
  filtroInfo: string = '';
  private capituloClaveCache: string | null = null;
  private capituloClaveLoaded: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private budgetsProductsService: BudgetsProductsService,
    private fb: FormBuilder,
    private authLoginService: AuthLoginService,
    private alertService: CoreAlertService,
    private http: HttpClient
  ) {
    this.requisitionForm = this.fb.group({
      ct_area_id: [null], // Inicializar como null, se establecerá después
      justificacion: [''],
      item: [null, Validators.required],
      product: [null],
      descripcionProyecto: [''],
    });
    this.monthNames = this.budgetsProductsService.getMonthNames();
    this.initMonthlyQuantities();
  }

  private async detectAndSetArea(): Promise<void> {
    if (!this.budgetItem?.idTecho) {
      this.error = 'Error: No se proporcionó un techo presupuestal válido';
      return;
    }

    try {
      // Verificar si existe proyecto anual
      const proyectoResponse = await firstValueFrom(
        this.budgetsProductsService.getProyectoAnualByTechoId(
          this.budgetItem.idTecho
        )
      );

      let areaInfo: { id_area_fin: number; nombre: string } | null = null;

      if (proyectoResponse?.success && proyectoResponse.project) {
        // Si existe proyecto anual, obtener área desde ahí
        const project = proyectoResponse.project;
        if (project.dt_techo?.ct_area_id) {
          areaInfo = {
            id_area_fin: project.dt_techo.ct_area_id,
            nombre:
              project.dt_techo.rl_area_financiero?.nombre ||
              this.budgetItem.unidad ||
              'Área detectada',
          };
        }
      } else {
        try {
          areaInfo = await firstValueFrom(
            this.budgetsProductsService.getAreaFinancieraFromTecho(
              this.budgetItem.idTecho
            )
          );
        } catch (techoError) {
          if (this.budgetItem.areaId) {
            areaInfo = {
              id_area_fin: this.budgetItem.areaId,
              nombre: this.budgetItem.unidad || 'Área desde budgetItem',
            };
          } else {
            throw new Error('No se pudo detectar área desde ninguna fuente');
          }
        }
      }

      if (areaInfo && areaInfo.id_area_fin > 0) {
        this.requisitionForm.get('ct_area_id')?.setValue(areaInfo.id_area_fin);
        this.loadProyectoAnualByTecho(this.budgetItem.idTecho);
      } else {
        this.error = `Error crítico: No se pudo detectar el área financiera para el techo presupuestal ${this.budgetItem.idTecho}. Contacte al administrador del sistema.`;
        this.alertService.error(this.error, 'Error de configuración');
      }
    } catch (error) {
      this.error = `Error al conectar con el servidor para detectar el área financiera: ${error}`;
      this.alertService.error(
        'Error de conexión al detectar área financiera',
        'Error de sistema'
      );
    }
  }

  async ngOnInit(): Promise<void> {
    console.log('=== INICIALIZACIÓN BUDGETS PRODUCTS ===');

    const state = history.state as { budgetItem: BudgetItem };

    if (state?.budgetItem) {
      this.budgetItem = state.budgetItem;

      console.log('📋 Budget Item recibido desde budgets.component.ts:', {
        idTecho: this.budgetItem.idTecho,
        tipoIdTecho: typeof this.budgetItem.idTecho,
        unidad: this.budgetItem.unidad,
        presupuestado: this.budgetItem.presupuestado,
        todasLasPropiedades: Object.keys(this.budgetItem),
      });

      // ✅ CORRECCIÓN: Validación mejorada del techo presupuestal
      if (!this.budgetItem.idTecho || this.budgetItem.idTecho <= 0) {
        console.error('❌ TECHO PRESUPUESTAL INVÁLIDO:', {
          valor: this.budgetItem.idTecho,
          tipo: typeof this.budgetItem.idTecho,
          budgetItemCompleto: this.budgetItem,
        });

        // Buscar en propiedades alternativas del objeto
        const propiedadesAlternativas = ['id_techo', 'techo_id', 'techoId'];
        let techoEncontrado = false;

        for (const prop of propiedadesAlternativas) {
          if (this.budgetItem[prop] && this.budgetItem[prop] > 0) {
            console.log(
              `✅ Techo encontrado en propiedad alternativa '${prop}':`,
              this.budgetItem[prop]
            );
            this.budgetItem.idTecho = Number(this.budgetItem[prop]);
            techoEncontrado = true;
            break;
          }
        }

        if (!techoEncontrado) {
          console.error(
            '❌ NO SE ENCONTRÓ TECHO PRESUPUESTAL VÁLIDO EN NINGUNA PROPIEDAD'
          );
          this.error =
            'Error crítico: No se recibió un techo presupuestal válido desde la tabla. ' +
            'Esto indica un problema en la configuración de datos. ' +
            'Regresando al listado de presupuestos...';
          this.alertService.error(this.error, 'Error de navegación');
          setTimeout(() => {
            this.router.navigate(['/promette/budgets']);
          }, 3000);
          return;
        }
      }

      console.log(
        `✅ TECHO PRESUPUESTAL FINAL VALIDADO: ${this.budgetItem.idTecho}`
      );
      this.loadTechoDetallado();
    } else {
      console.error('❌ No se recibieron datos en history.state');
      this.error =
        'Error: No se recibieron datos del presupuesto. Regresando al listado.';
      this.alertService.error(this.error, 'Error de navegación');
      setTimeout(() => {
        this.router.navigate(['/promette/budgets']);
      }, 2000);
      return;
    }

    try {
      this.currentUserId = await this.getCurrentUserAsync();
      if (!this.currentUserId) {
        this.alertService.warning(
          'No se pudo identificar el usuario. Usando usuario por defecto.',
          'Advertencia'
        );
      }
    } catch (error) {}

    this.loadInitialData();
    this.requisitionForm
      .get('item')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((itemVal) => {
        const prevItemId = this.selectedItemId;
        const justificacionValue =
          this.requisitionForm.get('justificacion')?.value;
        if (
          prevItemId &&
          itemVal &&
          prevItemId !== itemVal &&
          justificacionValue &&
          justificacionValue.trim().length > 0 &&
          this.selectedProduct
        ) {
          this.addToList();
        }

        this.requisitionForm.get('product')?.reset();

        if (!itemVal) {
          this.selectedItemId = null;
          this.products = [];
          this.productsOriginal = [];
          this.cancelProductSelection();
          return;
        }

        const itemId = Number(itemVal);
        this.selectedItemId = itemId;

        // Limpiar la justificación si la partida cambió
        if (prevItemId !== itemId) {
          this.requisitionForm.get('justificacion')?.reset();
        }

        this.loadProductsByItem(itemId);
      });

    this.requisitionForm
      .get('product')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((prodVal) => {
        try {
          if (!prodVal) {
            this.selectedProduct = null;
            this.initMonthlyQuantities();
            return;
          }

          const prodId = Number(prodVal);
          const prod = this.productsOriginal.find(
            (p) => p.id_producto === prodId
          );

          if (!prod) {
            this.error = `Error: Producto con ID ${prodId} no encontrado`;
            setTimeout(() => (this.error = null), 3000);
            this.selectedProduct = null;
            return;
          }

          if (!this.isEditing) {
            const alreadySelected = this.selectedProducts.some(
              (p) => p.product.id_producto === prodId
            );

            if (alreadySelected) {
              this.error = 'Este producto ya está agregado a la requisición.';
              setTimeout(() => (this.error = null), 3000);
              this.requisitionForm.get('product')?.reset();
              return;
            }
          }
          this.selectedProduct = prod;
          this.initMonthlyQuantities();
        } catch (error) {
          this.error = 'Error al procesar la selección del producto';
          setTimeout(() => (this.error = null), 3000);
          this.selectedProduct = null;
        }
      });

    this.requisitionForm.get('item')?.disable();
    this.requisitionForm.get('product')?.disable();
    this.requisitionForm.get('justificacion')?.enable();

    this.requisitionForm
      .get('descripcionProyecto')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((desc) => {
        if (!desc || desc.trim().length === 0) {
          this.requisitionForm.get('item')?.disable();
          this.requisitionForm.get('product')?.disable();
          this.requisitionForm.get('item')?.setValue(null);
          this.requisitionForm.get('product')?.setValue(null);
          this.selectedItemId = null;
          this.selectedProduct = null;
        } else {
          this.requisitionForm.get('item')?.enable();
        }
      });

    this.requisitionForm
      .get('item')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((itemVal) => {
        if (!itemVal) {
          this.requisitionForm.get('product')?.disable();
          this.requisitionForm.get('product')?.setValue(null);
          this.selectedProduct = null;
          this.initMonthlyQuantities();
        } else {
          this.requisitionForm.get('product')?.enable();
        }
      });

    this.requisitionForm
      .get('item')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((itemVal) => {
        const prevItemId = this.selectedItemId;
        const justificacionValue =
          this.requisitionForm.get('justificacion')?.value;
        if (
          prevItemId &&
          itemVal &&
          prevItemId !== itemVal &&
          justificacionValue &&
          justificacionValue.trim().length > 0 &&
          this.selectedProduct
        ) {
          this.addToList();
        }

        this.requisitionForm.get('product')?.reset();

        if (!itemVal) {
          this.selectedItemId = null;
          this.products = [];
          this.productsOriginal = [];
          this.cancelProductSelection();
          return;
        }

        const itemId = Number(itemVal);
        this.selectedItemId = itemId;

        if (prevItemId !== itemId) {
          this.requisitionForm.get('justificacion')?.reset();
        }

        this.loadProductsByItem(itemId);

        // Al seleccionar una partida válida, buscar la justificación existente
        if (itemVal && this.requisitionForm.get('ct_area_id')?.value) {
          const areaId = this.requisitionForm.get('ct_area_id')?.value;
          // ✅ CORRECCIÓN: Incluir techo_id en la consulta para mayor precisión
          this.budgetsProductsService
            .getJustificacionByPartidaAndArea(
              itemVal,
              areaId,
              this.budgetItem?.idTecho
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((justificacion) => {
              if (justificacion && justificacion.justificacion) {
                // Si existe, mostrarla en el input
                this.requisitionForm
                  .get('justificacion')
                  ?.setValue(justificacion.justificacion);
              } else {
                // Si no existe, limpiar el campo
                this.requisitionForm.get('justificacion')?.setValue('');
              }
            });
        }
      });

    // Cuando cambie el producto - mejorando la detección y manejo de errores
    this.requisitionForm
      .get('product')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((prodVal) => {
        try {
          if (!prodVal) {
            this.selectedProduct = null;
            this.initMonthlyQuantities();
            return;
          }

          const prodId = Number(prodVal);
          const prod = this.productsOriginal.find(
            (p) => p.id_producto === prodId
          );

          if (!prod) {
            this.error = `Error: Producto con ID ${prodId} no encontrado`;
            setTimeout(() => (this.error = null), 3000);
            this.selectedProduct = null;
            return;
          }

          // Si ya está en la lista y no estamos editando, mostrar error
          if (!this.isEditing) {
            const alreadySelected = this.selectedProducts.some(
              (p) => p.product.id_producto === prodId
            );

            if (alreadySelected) {
              this.error = 'Este producto ya está agregado a la requisición.';
              setTimeout(() => (this.error = null), 3000);
              this.requisitionForm.get('product')?.reset();
              return;
            }
          }

          this.selectedProduct = prod;
          this.initMonthlyQuantities(); // Reiniciar cantidades con el nuevo producto seleccionado
        } catch (error) {
          this.error = 'Error al procesar la selección del producto';
          setTimeout(() => (this.error = null), 3000);
          this.selectedProduct = null;
        }
      });

    // Inicialmente deshabilitar todos los campos menos la descripción
    this.requisitionForm.get('item')?.disable();
    this.requisitionForm.get('product')?.disable();
    // Quitar cualquier deshabilitación al input de justificación
    this.requisitionForm.get('justificacion')?.enable();

    // Habilitar partida solo si hay descripción válida
    this.requisitionForm
      .get('descripcionProyecto')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((desc) => {
        if (!desc || desc.trim().length === 0) {
          this.requisitionForm.get('item')?.disable();
          this.requisitionForm.get('product')?.disable();
          // No deshabilitar ni limpiar justificación
          this.requisitionForm.get('item')?.setValue(null);
          this.requisitionForm.get('product')?.setValue(null);
          this.selectedItemId = null;
          this.selectedProduct = null;
          // this.initMonthlyQuantities();
        } else {
          this.requisitionForm.get('item')?.enable();
        }
      });

    // Habilitar producto solo si hay partida seleccionada
    this.requisitionForm
      .get('item')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((itemVal) => {
        if (!itemVal) {
          this.requisitionForm.get('product')?.disable();
          this.requisitionForm.get('product')?.setValue(null);
          this.selectedProduct = null;
          this.initMonthlyQuantities();
        } else {
          this.requisitionForm.get('product')?.enable();
        }
      });
  }

  ngOnDestroy(): void {
    // ✅ AÑADIR: Limpiar cache al destruir el componente
    this.clearCapituloClaveCache();
    this.destroy$.next();
    this.destroy$.complete();
  }
  private getCurrentUserFromStorage(): number | null {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        try {
          const tokenParts = authToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const userId =
              payload.id_usuario ||
              payload.id ||
              payload.userId ||
              payload.user_id ||
              payload.sub;

            if (userId) {
              return Number(userId);
            }
          }
        } catch (tokenError) {}
      }

      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);

          const userId = userData.id_usuario || userData.id || userData.userId;

          if (userId) {
            return Number(userId);
          }
        } catch (parseError) {}
      }

      // Como esto es síncrono, mejor usar la estrategia asíncrona solo como fallback
      this.authLoginService.isLoggedInInfo().subscribe({
        next: (isLoggedIn) => {
          if (isLoggedIn) {
            // El usuario se actualizará en Redux, pero no podemos devolverlo síncronamente
          }
        },
        error: (error) => {},
      });
      return null;
    } catch (error) {
      return null;
    }
  }
  private async getCurrentUserAsync(): Promise<number | null> {
    try {
      const userId = this.getCurrentUserFromStorage();
      if (userId) {
        return userId;
      }
      try {
        const isLoggedIn = await firstValueFrom(
          this.authLoginService.isLoggedInInfo()
        );

        if (isLoggedIn) {
          const userIdAfterRefresh = this.getCurrentUserFromStorage();
          if (userIdAfterRefresh) {
            return userIdAfterRefresh;
          }
        }
      } catch (serverError) {}

      return null;
    } catch (error) {
      return null;
    }
  }

  private validateCurrentUser(): number {
    // Si ya tenemos usuario, usarlo
    if (this.currentUserId && this.currentUserId > 0) {
      return this.currentUserId;
    }

    // Si no tenemos usuario, intentar obtenerlo síncrono
    const userId = this.getCurrentUserFromStorage();

    if (userId) {
      this.currentUserId = userId;
      return userId;
    }

    // Fallback final
    this.alertService.warning(
      'No se pudo identificar el usuario. Usando usuario por defecto.',
      'Advertencia'
    );

    this.currentUserId = 1;
    return 1;
  }

  private loadTechoDetallado(): void {
    if (!this.budgetItem?.idTecho) {
      // Si no hay techo, cargar todas las partidas sin filtro
      this.loadItems();
      return;
    }
    this.idArea = this.budgetItem?.areaId || 0;
    this.budgetsProductsService
      .getChapterFromBudgetCeiling(this.budgetItem.idTecho)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chapterInfo) => {
          if (chapterInfo) {
            this.capituloActual = chapterInfo.chapterKey;
            this.filtroInfo = this.budgetsProductsService.getChapterFilterInfo(
              chapterInfo.chapterKey
            );
            this.processCapituloClave(chapterInfo.chapterKey);
            this.loadItems();
          } else {
            this.filtroInfo = 'Sin filtro aplicado';
            this.capituloActual = null;
            this.loadItems();
          }
        },
        error: (error) => {
          this.filtroInfo = 'Error al cargar filtro';
          this.capituloActual = null;
          this.loadItems();
        },
      });
  }

  private processCapituloClave(chapterKey: number): void {
    if (this.capituloClaveLoaded) {
      return; // Ya se procesó, no hacer nada
    }
    this.capituloClaveCache = chapterKey.toString();
    this.capituloClaveLoaded = true;
  }

  getCapituloClave(): string | null {
    // Si ya se procesó, devolver el valor cacheado sin logs
    if (this.capituloClaveLoaded) {
      return this.capituloClaveCache;
    }

    // Si no se ha cargado aún, intentar extraer del budgetItem
    if (this.budgetItem?.capitulo) {
      const match = this.budgetItem.capitulo.match(/^(\d+)/);
      if (match) {
        this.capituloClaveCache = match[1];
        this.capituloClaveLoaded = true;
        return this.capituloClaveCache;
      }
    }

    return null;
  }

  private loadItems(): void {
    this.budgetsProductsService
      .getItemsRestricted(this.idArea, this.capituloActual || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.itemsOriginal = items;

          // Formatear para dropdown
          this.items = items.map((i) => ({
            label: `${i.clave_partida} - ${i.nombre_partida}`,
            value: i.id_partida,
          }));

          if (this.capituloActual) {
            if (this.items.length === 0) {
              this.error = `No hay partidas disponibles para el capítulo ${this.capituloActual}`;
              setTimeout(() => (this.error = null), 5000);
            } else {
              this.error = null;
            }
          } else {
            console.log(`📋 Todas las partidas cargadas: ${this.items.length}`);
          }
        },
        error: (error) => {
          this.error = 'Error al cargar partidas';
        },
      });
  }

  private clearCapituloClaveCache(): void {
    this.capituloClaveCache = null;
    this.capituloClaveLoaded = false;
  }
  getFiltroInfo(): string {
    return this.filtroInfo;
  }

  hasActiveFilter(): boolean {
    return this.capituloActual !== null;
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const areas = await firstValueFrom(
        this.budgetsProductsService.getAllAreas()
      );
      this.areasOriginal = areas;
      this.areas = areas.map((a) => ({
        label: a.nombre_area,
        value: a.id_area,
      }));
      if (this.budgetItem?.idTecho) {
        await this.detectAndSetArea();
      }
    } catch (err) {
      console.error(' Error general al cargar datos iniciales:', err);
      this.error =
        'No se pudieron cargar datos iniciales: ' + (err as Error).message;
    } finally {
      this.loading = false;
      console.log('Carga de datos iniciales finalizada');
    }
  }

  loadProductsByItem(itemId: number): void {
    if (!itemId) {
      console.log(' No se proporcionó ID de partida');
      this.products = [];
      this.productsOriginal = [];
      this.selectedProduct = null;
      return;
    }

    console.log(`Iniciando carga de productos para partida ID: ${itemId}`);
    this.loading = true;
    this.error = null;

    // Limpiar las listas de productos
    this.products = [];
    this.productsOriginal = [];
    this.selectedProduct = null;

    // PASO 2: Llamar al método que maneja el endpoint de productos
    this.budgetsProductsService
      .getProductsRestrictedByItem(this.idArea, itemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;

          // Verificar si la respuesta es exitosa
          if (!response || !response.success) {
            // Manejar endpoint no implementado (error esperado)
            if (
              response?.isExpectedError &&
              response?.errorType === 'ENDPOINT_NOT_IMPLEMENTED'
            ) {
              this.error = null; // No mostrar error al usuario
              // Deshabilitar temporalmente el control de producto
              const productControl = this.requisitionForm.get('product');
              if (productControl) {
                productControl.disable();
              }

              return;
            }

            // Manejar errores de conexión u otros errores inesperados
            if (response?.errorType === 'CONNECTION_ERROR') {
              console.warn('⚠️ Error de conexión al cargar productos');
              this.error =
                'Error de conexión al servidor. Verifique su conexión a internet.';
              return;
            }

            this.error =
              response?.msg || 'Error inesperado al cargar productos';
            return;
          }

          // Procesar productos exitosamente recibidos
          const productos = response.products || [];
          if (productos.length === 0) {
            this.error = null; // No mostrar como error

            // Deshabilitar el control de producto
            const productControl = this.requisitionForm.get('product');
            if (productControl) {
              productControl.disable();
            }
            return;
          }

          // Guardar lista original con información normalizada
          this.productsOriginal = productos.map((p: any) => ({
            ...p,
            id_producto: p.id_producto,
            nombre_producto: p.nombre_producto,
            precio:
              typeof p.precio === 'number'
                ? p.precio
                : parseFloat(p.precio || '0'),
            ct_partida_id: p.ct_partida_id,
            clave_partida: p.clave_partida || p.ct_partida?.clave_partida || '',
            nombre_partida:
              p.nombre_partida || p.ct_partida?.nombre_partida || '',
            ct_partida: p.ct_partida || null,
          }));

          // Formatear para el dropdown de PrimeNG
          this.products = this.productsOriginal.map((p: any) => {
            const precio = p.precio || 0;
            const precioFormateado = this.formatCurrency(precio);
            const partidaInfo = p.clave_partida ? `[${p.clave_partida}] ` : '';
            const label = `${partidaInfo}${
              p.nombre_producto || 'Producto sin nombre'
            } (${precioFormateado})`;

            return {
              label,
              value: p.id_producto,
            };
          });

          // Habilitar el control de producto
          const productControl = this.requisitionForm.get('product');
          if (productControl) {
            productControl.enable();
          }
        },
        error: (httpError) => {
          this.loading = false;

          // Este bloque debería raramente ejecutarse ya que el catchError en el servicio maneja la mayoría de errores
          if (httpError.status === 404) {
            this.error = null; // No mostrar al usuario
          } else {
            this.error = `Error de red al cargar productos: ${
              httpError.status || 'Error desconocido'
            }`;
          }
        },
      });
  }

  /**
   * Inicializa el arreglo de cantidades mensuales y asegura la creación de un nuevo array
   */
  private initMonthlyQuantities(): void {
    // Crear un nuevo array para evitar problemas de referencia
    this.monthlyQuantities = [];

    // Inicializar cada mes con cantidad 0
    for (let i = 0; i < this.monthNames.length; i++) {
      this.monthlyQuantities.push({
        mes: i + 1,
        nombre: this.monthNames[i],
        cantidad: 0,
      });
    }
    this.totalQuantity = 0;
  }
  /**
   * Actualiza el total sumando todas las cantidades mensuales
   */ updateTotal(): void {
    try {
      // Calcular la suma de todas las cantidades
      let sum = 0;
      for (const month of this.monthlyQuantities) {
        // Asegurar que cantidad sea un número
        const cantidad = Number(month.cantidad) || 0;
        sum += cantidad;
      }

      // Actualizar el total
      this.totalQuantity = sum;

      // Actualizar total reactivo de la requisición
      this.currentRequisitionTotal = this.calculateTotalCost();

      // Actualizar el estado del presupuesto en tiempo real
      this.updateBudgetStatus();
    } catch (error) {
      // Asegurarse de que totalQuantity siempre sea un número válido
      this.totalQuantity = this.monthlyQuantities.reduce(
        (sum, m) => sum + (Number(m.cantidad) || 0),
        0
      );
      this.currentRequisitionTotal = this.calculateTotalCost();

      // Actualizar el estado de presupuesto incluso en caso de error
      this.updateBudgetStatus();
    }
  }

  cancelProductSelection(): void {
    this.selectedProduct = null;
    this.initMonthlyQuantities();
    this.isEditing = false;
    this.editingProductId = null;

    // Asegurarse de limpiar el control sin generar un nuevo evento
    const productControl = this.requisitionForm.get('product');
    if (productControl) {
      productControl.setValue(null, { emitEvent: false });
      productControl.enable(); // Asegurarse de que el control esté habilitado
    }
  }
  addToList(): void {
    // Validar que haya una partida seleccionada
    if (!this.selectedItemId) {
      this.error = 'Debe seleccionar una partida antes de agregar productos.';
      setTimeout(() => (this.error = null), 3000);
      return;
    }

    // Validar que haya un producto seleccionado
    if (!this.selectedProduct) {
      this.error = 'Debe seleccionar un producto.';
      setTimeout(() => (this.error = null), 3000);
      return;
    }

    if (this.totalQuantity === 0) {
      this.error = 'Debe asignar al menos una cantidad.';
      setTimeout(() => (this.error = null), 3000);
      return;
    }

    // Verificar el presupuesto antes de agregar
    if (
      this.budgetItem &&
      this.willProductExceedBudget(this.selectedProduct, this.totalQuantity)
    ) {
      this.error = `Agregar este producto excedería el presupuesto disponible de ${this.formatCurrency(
        this.simulatedMontoDisponible
      )}`;
      // Solo mostrar advertencia, permitir continuar si el usuario lo desea
    }

    try {
      if (this.isEditing && this.editingProductId) {
        // Actualizar producto existente
        const idx = this.selectedProducts.findIndex(
          (p) => p.tempId === this.editingProductId
        );
        if (idx > -1) {
          this.selectedProducts[idx] = {
            tempId: this.editingProductId!,
            product: this.selectedProduct,
            monthlyQuantities: [...this.monthlyQuantities],
            totalQuantity: this.totalQuantity,
          };
          this.success = 'Distribución actualizada correctamente';
        } else {
          console.error('❌ No se encontró el producto para actualizar');
        }
      } else {
        // Validar que el producto no esté ya agregado (solo si no estamos editando)
        const alreadyExists = this.selectedProducts.some(
          (p) => p.product.id_producto === this.selectedProduct!.id_producto
        );
        if (!this.selectedProducts) {
          this.selectedProducts = [];
        }
        if (alreadyExists) {
          /*this.error = 'Este producto ya está agregado a la requisición.';
          setTimeout(() => (this.error = null), 3000);
          return;*/
          let currentProduct = this.selectedProducts.find(
            (p) => p.product.id_producto === this.selectedProduct!.id_producto);
          
          if (currentProduct) {
            for (let i = 0; i < this.monthNames.length; i++) {
              if (currentProduct) {
                currentProduct.monthlyQuantities[i].cantidad += this.monthlyQuantities[i].cantidad;
              }
            }
            currentProduct.totalQuantity += this.totalQuantity;
          }
        } else {
          // Agregar nuevo producto
          const newProduct: ProductSelection = {
            tempId: this.budgetsProductsService.generateTempId(),
            product: { ...this.selectedProduct },
            monthlyQuantities: this.monthlyQuantities.map((m) => ({ ...m })),
            totalQuantity: this.totalQuantity,
          };
          this.selectedProducts.push(newProduct);
        }


        
        this.success = 'Producto agregado correctamente';
      }

      this.selectedProducts = [...this.selectedProducts];

      this.updateBudgetStatus();
      this.selectedProduct = null;
      this.initMonthlyQuantities();
      this.isEditing = false;
      this.editingProductId = null;
      const productControl = this.requisitionForm.get('product');
      if (productControl) {
        productControl.setValue(null, { emitEvent: false });
        productControl.enable();
      }
      setTimeout(() => (this.success = null), 2000);
    } catch (error) {
      console.error('💥 Error al procesar producto:', error);
      this.error = 'Ocurrió un error al procesar el producto';
      setTimeout(() => (this.error = null), 3000);
    }
  }

  editProductDistribution(ps: ProductSelection): void {
    try {
      this.cancelProductSelection();
      this.isEditing = true;
      this.editingProductId = ps.tempId;
      this.selectedProduct = ps.product;
      this.monthlyQuantities = ps.monthlyQuantities.map((m) => ({ ...m }));
      this.totalQuantity = ps.totalQuantity;
      if (this.selectedItemId !== ps.product.ct_partida_id) {
        this.requisitionForm.get('item')?.setValue(ps.product.ct_partida_id);
      }
      const productControl = this.requisitionForm.get('product');
      if (productControl) {
        productControl.setValue(ps.product.id_producto, { emitEvent: false });
        productControl.disable();
      }
      setTimeout(() => {
        document
          .querySelector('.monthly-quantities')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error al editar la distribución del producto:', error);
      this.error =
        'Ocurrió un error al editar el producto. Inténtelo de nuevo.';
      setTimeout(() => (this.error = null), 3000);
    }
  }

  removeProduct(tempId: string): void {
    // Remover de la lista
    this.selectedProducts = this.selectedProducts.filter(
      (p) => p.tempId !== tempId
    );

    // Si estábamos editando este producto, cancelar edición
    if (this.editingProductId === tempId) {
      this.cancelProductSelection();
    }

    // Actualizar el estado del presupuesto después de eliminar
    this.updateBudgetStatus();
  }

  getSelectedPartidaName(): string {
    if (!this.selectedProduct) return '';

    // Usar la información de partida incluida en el producto (ahora disponible como propiedades directas)
    if (
      this.selectedProduct.clave_partida &&
      this.selectedProduct.nombre_partida
    ) {
      return `${this.selectedProduct.clave_partida} - ${this.selectedProduct.nombre_partida}`;
    }

    // Fallback: usar la información del objeto ct_partida si está disponible
    if (this.selectedProduct.ct_partida) {
      return `${this.selectedProduct.ct_partida.clave_partida} - ${this.selectedProduct.ct_partida.nombre_partida}`;
    }

    // Último fallback: buscar en la lista original de partidas usando el ID seleccionado
    if (!this.selectedItemId) return '';
    const item = this.itemsOriginal.find(
      (i) => i.id_partida === this.selectedItemId
    );
    return item ? `${item.clave_partida} - ${item.nombre_partida}` : '';
  }
  private async createJustificacionForPartida(
    partidaId: number,
    areaId: number,
    techoId: number,
    justificacion: string
  ): Promise<void> {
    if (!justificacion || justificacion.trim().length === 0) {
      console.log('⚠️ COMPONENTE: No hay justificación para crear');
      return;
    }

    // ✅ VALIDACIÓN CRÍTICA: Verificar que techoId sea válido ANTES de enviar
    if (!techoId || techoId <= 0) {
      console.error('❌ COMPONENTE: Techo presupuestal inválido para justificación:', {
        techoId,
        partidaId,
        areaId,
        budgetItemIdTecho: this.budgetItem?.idTecho
      });

      // ✅ INTENTAR USAR EL TECHO DEL BUDGET ITEM COMO FALLBACK
      const techoFallback = this.budgetItem?.idTecho;
      if (techoFallback && techoFallback > 1) {
        console.log(`✅ COMPONENTE: Usando techo del budgetItem como fallback: ${techoFallback}`);
        techoId = techoFallback;
      } else {
        throw new Error(`Techo presupuestal inválido (${techoId}). No se puede crear justificación sin un techo válido.`);
      }
    }

    try {
      const justificacionData = {
        ct_partida_id: partidaId,
        ct_area_id: areaId,
        dt_techo_id: techoId, // ✅ ASEGURAR QUE NUNCA SEA NULL O <= 1
        justificacion: justificacion.trim(),
        ct_usuario_id: this.currentUserId || 1,
      };

      console.log('📝 COMPONENTE: Enviando justificación al servicio:', {
        ct_partida_id: justificacionData.ct_partida_id,
        ct_area_id: justificacionData.ct_area_id,
        dt_techo_id: justificacionData.dt_techo_id,
        justificacion: justificacionData.justificacion.substring(0, 50) + '...',
        ct_usuario_id: justificacionData.ct_usuario_id
      });

      // ✅ VALIDACIÓN FINAL ANTES DE ENVIAR
      if (justificacionData.dt_techo_id <= 0) {
        throw new Error(`ID de techo presupuestal inválido: ${justificacionData.dt_techo_id}`);
      }

      if (justificacionData.ct_area_id <= 0) {
        throw new Error(`ID de área financiera inválido: ${justificacionData.ct_area_id}`);
      }

      if (justificacionData.ct_partida_id <= 0) {
        throw new Error(`ID de partida inválido: ${justificacionData.ct_partida_id}`);
      }

      const response = await firstValueFrom(
        this.budgetsProductsService.upsertJustificacion(justificacionData)
      );

      console.log('✅ COMPONENTE: Respuesta recibida del servicio:', response);

      const typedResponse = response as {
        success: boolean;
        justificacion?: any;
        msg?: string;
        created?: boolean;
        updated?: boolean;
        error_type?: string;
      };

      if (typedResponse.success) {
        const accion = typedResponse.created ? 'creada' : 'actualizada';
        console.log(`✅ COMPONENTE: Justificación ${accion} exitosamente:`, typedResponse.justificacion);
      } else {
        console.warn('⚠️ COMPONENTE: Error al procesar justificación:', typedResponse.msg);

        // ✅ MANEJO ESPECÍFICO DE ERRORES DE TECHO PRESUPUESTAL
        if (typedResponse.error_type === 'INVALID_TECHO_PRESUPUESTAL' ||
            typedResponse.error_type === 'TECHO_PRESUPUESTAL_NOT_FOUND') {
          throw new Error(`Error de techo presupuestal: ${typedResponse.msg}`);
        }
      }
    } catch (error) {
      console.error('❌ COMPONENTE: Error al procesar justificación:', error);

      if (error instanceof Error) {
        console.error('   - Mensaje:', error.message);
        console.error('   - Stack:', error.stack);
      }

      // ✅ LANZAR ERROR SI ES CRÍTICO PARA DETENER EL FLUJO
      if (error instanceof Error &&
          (error.message.includes('Techo presupuestal inválido') ||
           error.message.includes('Error de techo presupuestal') ||
           error.message.includes('ID de techo presupuestal inválido'))) {
        throw error; // Esto detendrá el proceso de creación de requisiciones
      }

      // Para otros errores, no interrumpir el flujo
      console.warn('⚠️ Error no crítico en justificación, continuando...');
    }
  }

  // ✅ MEJORAR: Agregar más logs en submitRequisition para ver el flujo completo
  async submitRequisition(): Promise<void> {
    if (this.exceedsAvailableBudget) {
      this.alertService.error('Ha excedido el límite de su presupuesto', 'Error de configuración crítico');
      return;
    }

    if (this.submitting) return;

    console.log('🚀 INICIANDO ENVÍO DE REQUISICIÓN');

    // ✅ VALIDACIÓN INICIAL DEL TECHO PRESUPUESTAL
    const techoId = this.budgetItem?.idTecho;

    console.log('🔍 VALIDACIÓN INICIAL DEL TECHO PRESUPUESTAL:', {
      techoIdDelBudgetItem: techoId,
      tipoTechoId: typeof techoId,
      esValido: !!(techoId && techoId > 0),
      budgetItemCompleto: this.budgetItem,
    });

    // ✅ PRIMERA VALIDACIÓN: Verificar que tenemos un techo válido
    if (!techoId || techoId <= 0) {
      console.error('❌ TECHO PRESUPUESTAL CRÍTICO INVÁLIDO EN SUBMIT:', {
        valor: techoId,
        tipo: typeof techoId,
        budgetItem: this.budgetItem,
      });

      this.error =
        'Error crítico: Techo presupuestal inválido o no identificado. ' +
        `Valor recibido: ${techoId}. ` +
        'Se requiere un techo presupuestal válido (mayor a 1) para crear requisiciones y justificaciones. ' +
        'Por favor, regrese al listado y seleccione un presupuesto válido.';
      this.alertService.error(this.error, 'Error de configuración crítico');
      return;
    }

    console.log(`✅ TECHO PRESUPUESTAL VÁLIDO CONFIRMADO: ${techoId}`);

    // ✅ VALIDACIÓN DEL USUARIO
    this.currentUserId = this.validateCurrentUser();

    // ✅ VALIDACIÓN DE PRODUCTOS
    if (this.selectedProducts.length === 0) {
      this.error = 'Debe agregar al menos un producto a la requisición antes de generar.';
      this.alertService.warning(this.error);
      return;
    }

    const hasProductsWithQuantities = this.selectedProducts.some(
      (p) => p.monthlyQuantities.some((m) => m.cantidad > 0) || p.totalQuantity > 0
    );

    if (!hasProductsWithQuantities) {
      this.error = 'Debe asignar al menos una cantidad a los productos';
      this.alertService.warning(this.error);
      return;
    }

    // ✅ VALIDACIÓN DEL ÁREA FINANCIERA
    let areaIdFinal = this.requisitionForm.get('ct_area_id')?.value;

    if (!areaIdFinal || areaIdFinal <= 0) {
      this.error =
        'Error crítico: No se pudo determinar el área financiera válida. ' +
        'Esto puede deberse a una configuración incorrecta del techo presupuestal. ' +
        'Por favor, contacte al administrador del sistema.';
      this.alertService.error(this.error, 'Error de configuración del sistema');
      return;
    }

    console.log('✅ ÁREA FINANCIERA VALIDADA:', areaIdFinal);

    // ✅ VALIDACIÓN DE PRESUPUESTO (opcional, permite continuar)
    if (this.budgetItem && this.exceedsAvailableBudget) {
      try {
        const confirmResult = await this.alertService.confirm(
          `Esta requisición excede el presupuesto disponible. ¿Desea continuar?`
        );
        if (!confirmResult.isConfirmed) {
          return;
        }
      } catch (error) {
        return;
      }
    }

    this.submitting = true;
    this.error = null;
    this.success = 'Procesando requisición...';

    // ✅ OBTENER DATOS DEL FORMULARIO
    const justificacionFormValue = this.requisitionForm.get('justificacion')?.value;
    const justificacionGeneral = justificacionFormValue && justificacionFormValue.trim().length > 0
      ? justificacionFormValue.trim()
      : undefined;

    const descripcionFormValue = this.requisitionForm.get('descripcionProyecto')?.value;
    const descripcion = descripcionFormValue && descripcionFormValue.trim().length > 0
      ? descripcionFormValue.trim()
      : undefined;

    console.log('📝 DATOS DEL FORMULARIO VALIDADOS:', {
      justificacionGeneral: justificacionGeneral?.substring(0, 50) + '...',
      descripcion: descripcion?.substring(0, 50) + '...',
      techoId,
      areaIdFinal,
      usuarioId: this.currentUserId
    });

    const requestData = {
      dt_techo_id: techoId,
      ct_area_id: areaIdFinal,
      ct_usuario_id: this.currentUserId,
      justificacion: justificacionGeneral,
      descripcion: descripcion,
      selectedProducts: this.selectedProducts,
    };

    try {
      // ✅ ASEGURAR PROYECTO ANUAL SI NO EXISTE
      if (techoId && !this.proyectoAnual) {
        try {
          const proyectoCreado = await firstValueFrom(
            this.budgetsProductsService.ensureProyectoAnualExists(techoId)
          );
          if (proyectoCreado) {
            this.proyectoAnual = proyectoCreado;
            this.originalMontoAsignado = Number(proyectoCreado.monto_asignado) || this.budgetItem?.presupuestado || 0;
          }
        } catch (projError) {
          console.warn('⚠️ Error al asegurar proyecto anual, continuando...', projError);
        }
      }

      // ✅ CREAR JUSTIFICACIONES POR PARTIDA CON VALIDACIÓN ESTRICTA
      if (justificacionGeneral && this.selectedProducts.length > 0) {
        console.log('📝 INICIANDO CREACIÓN DE JUSTIFICACIONES POR PARTIDA');
        console.log('   - Justificación general:', justificacionGeneral.substring(0, 100) + '...');
        console.log('   - Productos seleccionados:', this.selectedProducts.length);
        console.log('   - Techo presupuestal:', techoId);
        console.log('   - Área financiera:', areaIdFinal);

        // Obtener partidas únicas
        const partidasUnicas = Array.from(
          new Set(this.selectedProducts.map((p) => p.product.ct_partida_id))
        );

        console.log('   - Partidas únicas encontradas:', partidasUnicas);

        // ✅ CREAR JUSTIFICACIONES CON VALIDACIÓN ESTRICTA
        try {
          const justificacionPromises = partidasUnicas.map(partidaId => {
            console.log(`📝 Preparando justificación para partida ${partidaId}...`);
            return this.createJustificacionForPartida(
              partidaId,
              areaIdFinal,
              techoId, // ✅ TECHO VALIDADO
              justificacionGeneral
            );
          });

          await Promise.all(justificacionPromises);
          console.log('✅ TODAS LAS JUSTIFICACIONES PROCESADAS EXITOSAMENTE');
        } catch (justificacionError) {
          console.error('❌ ERROR CRÍTICO EN JUSTIFICACIONES:', justificacionError);

          // Si es un error crítico de techo presupuestal, detener completamente
          if (justificacionError instanceof Error &&
              (justificacionError.message.includes('Techo presupuestal inválido') ||
               justificacionError.message.includes('ID de techo presupuestal inválido'))) {
            this.error = `Error en justificaciones: ${justificacionError.message}`;
            this.alertService.error(this.error, 'Error de configuración');
            this.submitting = false;
            return;
          }

          // Para otros errores, mostrar advertencia pero continuar
          console.warn('⚠️ Error en justificaciones, pero continuando con requisiciones...');
          this.alertService.warning('Algunas justificaciones no pudieron crearse, pero las requisiciones se procesarán.');
        }
      } else {
        console.log('ℹ️ NO SE CREARÁN JUSTIFICACIONES:', {
          tieneJustificacion: !!justificacionGeneral,
          tieneProductos: this.selectedProducts.length > 0,
        });
      }

      // ✅ CREAR REQUISICIONES
      console.log('🚀 ENVIANDO DATOS AL BACKEND PARA CREAR REQUISICIONES');
      const response = await firstValueFrom(
        this.budgetsProductsService.createUnifiedRequisitions(requestData)
      );

      console.log('✅ RESPUESTA EXITOSA DEL BACKEND:', response);

      let successMsg = `Se crearon ${response.requisiciones || response['total'] || this.selectedProducts.length} requisiciones exitosamente.`;

      if (response.proyecto_anual) {
        successMsg += ' El presupuesto ha sido actualizado.';
      }
      if (response.justificaciones) {
        successMsg += ` Se registraron ${response.justificaciones} justificaciones.`;
      }

      this.success = successMsg;
      this.alertService.success(successMsg, 'Operación completada');

      // ✅ LIMPIAR FORMULARIO
      this.selectedProducts = [];
      this.requisitionForm.reset({
        ct_area_id: areaIdFinal,
        justificacion: '',
        descripcionProyecto: descripcion || '',
      });

      this.initMonthlyQuantities();
      this.selectedProduct = null;
      this.selectedItemId = null;

      if (this.close) {
        setTimeout(() => this.close?.(), 2000);
      }

      if (techoId) {
        this.loadProyectoAnualByTecho(techoId);
      }

    } catch (error: any) {
      console.error('❌ ERROR AL ENVIAR REQUISICIÓN:', {
        error: error,
        status: error.status,
        message: error.message,
        errorCompleto: error,
      });

      if (error.status === 400) {
        if (error.error?.error_type === 'FOREIGN_KEY_TECHO' ||
            error.error?.error_type === 'TECHO_NOT_FOUND') {
          this.error = `El techo presupuestal ID ${requestData.dt_techo_id} no existe en el sistema. Contacte al administrador.`;
        } else {
          this.error = error.error?.msg || 'Error de validación en los datos enviados';
        }
      } else if (error.status === 404) {
        this.error = 'No se encontró el recurso solicitado. Verifique la configuración del techo presupuestal.';
      } else if (error.status === 500) {
        this.error = 'Error interno del servidor. Contacte al administrador.';
      } else {
        this.error = error.message || 'Error al procesar la requisición';
      }

      this.alertService.error(this.error ?? 'Error desconocido', 'Error al crear requisiciones');
    } finally {
      this.submitting = false;
    }
  }
  /**
   * Maneja errores al actualizar el proyecto anual
   */
  /**
   * Carga el proyecto anual para el área seleccionada
   */
  loadProyectoAnual(areaId: number): void {
    if (!areaId) return;

    // ✅ CORRECCIÓN: Buscar el área financiera correspondiente usando id_area_fin
    const areaFinanciera = this.areasOriginal.find((a) => a.id_area === areaId);
    const areaFinancieroId = areaFinanciera?.id_area_fin || areaId;
    // Validación adicional
    if (!areaFinancieroId) {
      console.error('No se pudo determinar el área financiera');
      this.proyectoAnual = null;
      this.descripcionProyecto = '';
      return;
    }

    this.budgetsProductsService
      .getProyectoAnualByArea(areaFinancieroId) // Usar id_area_fin correcto
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.project) {
            this.proyectoAnual = response.project;
            this.descripcionProyecto = this.proyectoAnual.descripcion || '';
            this.requisitionForm
              .get('descripcionProyecto')
              ?.setValue(this.descripcionProyecto);

            // Inicializar propiedades reactivas del presupuesto
            this.originalMontoAsignado =
              Number(this.proyectoAnual.monto_asignado) || 0;
            this.originalMontoUtilizado =
              Number(this.proyectoAnual.monto_utilizado) || 0;
            this.currentRequisitionTotal = this.calculateTotalCost();
          } else {
            console.log('No se encontró proyecto anual para esta área');
            this.proyectoAnual = null;
            this.descripcionProyecto = '';
            this.requisitionForm.get('descripcionProyecto')?.setValue('');
          }
        },
        error: (err) => {
          console.error('Error al cargar proyecto anual:', err);
          this.proyectoAnual = null;
          this.descripcionProyecto = '';
        },
      });
  }

  /**
   * Carga el proyecto anual para un techo presupuestal específico
   */
  loadProyectoAnualByTecho(techoId: number): void {
    if (!techoId) return;

    this.budgetsProductsService
      .getProyectoAnualByTechoId(techoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.project) {
            this.proyectoAnual = response.project;
            this.descripcionProyecto = this.proyectoAnual.descripcion || '';
            this.requisitionForm
              .get('descripcionProyecto')
              ?.setValue(this.descripcionProyecto);
          } else {
            this.proyectoAnual = null;
            this.descripcionProyecto = `Proyecto anual ${new Date().getFullYear()} - ${
              this.budgetItem?.unidad || 'Área'
            }`;
            this.requisitionForm
              .get('descripcionProyecto')
              ?.setValue(this.descripcionProyecto);
          }
          this.initializeBudgetValues();
        },
        error: (err) => {
          console.error('Error al cargar proyecto anual:', err);
          this.proyectoAnual = null;
          this.descripcionProyecto = `Proyecto anual ${new Date().getFullYear()}`;
          this.initializeBudgetValues();
        },
      });
  }

  /**
   * Actualiza la descripción del proyecto anual
   */
  updateProyectoDescripcion(): void {
    if (!this.proyectoAnual || !this.proyectoAnual.id_proyecto_anual) {
      this.alertService.warning(
        'No hay un proyecto anual disponible para actualizar'
      );
      return;
    }

    const descripcion = this.requisitionForm.get('descripcionProyecto')?.value;

    this.budgetsProductsService
      .updateProyectoDescripcion(
        this.proyectoAnual.id_proyecto_anual,
        descripcion
      )
      .subscribe({
        next: (result) => {
          if (result && result.success) {
            this.alertService.success('Descripción actualizada correctamente');
            this.descripcionProyecto = descripcion;
            if (this.proyectoAnual) {
              this.proyectoAnual.descripcion = descripcion;
            }
          } else {
            this.alertService.error('No se pudo actualizar la descripción');
          }
        },
        error: (err) => {
          console.error('Error al actualizar la descripción:', err);
          this.alertService.error(
            'Error al actualizar la descripción del proyecto'
          );
        },
      });
  }
  willProductExceedBudget(
    product: ConsumableProduct,
    quantity: number
  ): boolean {
    if (!this.budgetItem) return false;

    const precio = product.precio || 0;
    const itemCost = precio * quantity;
    const totalWithNewItem = this.calculateTotalCost() + itemCost;

    // Si estamos editando, restamos primero el costo del producto que estamos editando
    if (this.isEditing && this.editingProductId) {
      const editingItem = this.selectedProducts.find(
        (p) => p.tempId === this.editingProductId
      );
      if (editingItem) {
        const editingProductPrice = editingItem.product.precio || 0;
        const editingItemCost = editingProductPrice * editingItem.totalQuantity;
        return (
          totalWithNewItem - editingItemCost > this.simulatedMontoDisponible
        );
      }
    }

    return totalWithNewItem > this.simulatedMontoDisponible;
  }

  calculateTotalCost(): number {
    return this.selectedProducts.reduce((total, ps) => {
      const precio = ps.product.precio || 0;
      return total + precio * ps.totalQuantity;
    }, 0);
  }
  updateBudgetStatus(): void {
    // Actualizar el total actual de la requisición
    this.currentRequisitionTotal = this.calculateTotalCost();

    // Verificar y activar/desactivar el modo reactivo según corresponda
    this.checkReactiveModeActivation();

    if (this.budgetItem) {
      // Verificar si excede el presupuesto usando propiedades reactivas
      if (this.exceedsAvailableBudget) {
        this.error = `¡Atención! La requisición excede el presupuesto disponible por ${this.formatCurrency(
          Math.abs(this.simulatedMontoDisponible)
        )}`;
      } else {
        this.error = null;
      }

      console.log(
        `Modo: ${this.isReactiveMode ? 'Reactivo' : 'Estático'}, ` +
          `Total requisición: ${this.formatCurrency(
            this.currentRequisitionTotal
          )}, ` +
          `Disponible: ${this.formatCurrency(this.montoDisponibleDisplay)}`
      );
    }
  }

  // Formatea un valor monetario para mostrar
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }

  getProductFormattedPrice(p: ConsumableProduct): string {
    try {
      const precio = p.precio ?? 0;
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(precio);
    } catch (error) {
      console.error('Error al formatear precio:', error);
      return '$0.00';
    }
  }

  // Dentro del método submitForm():
  submitForm(): void {
    console.log('🚀 INICIANDO GENERACIÓN DE REQUISICIÓN');

    // ✅ VALIDAR USUARIO
    const userId = this.validateCurrentUser();

    // Construir objeto
    const requisitionData = {
      dt_techo_id: this.budgetItem?.idTecho || null,
      ct_area_id: this.requisitionForm.get('ct_area_id')?.value || null,
      ct_usuario_id: userId, // ✅ USUARIO REAL O FALLBACK
      justificacion:
        this.requisitionForm.get('justificacion')?.value || undefined,
      selectedProducts: this.selectedProducts,
    };

    // ✅ LOGS MEJORADOS
    console.log('=== OBJETO ENVIADO ===');
    console.log('Usuario ID:', userId);
    console.log('¿Es usuario real?:', userId !== 1 ? 'SÍ' : 'FALLBACK');
    console.log('Objeto completo:', requisitionData);

    // Enviar...
    this.budgetsProductsService
      .createUnifiedRequisitions(requisitionData)
      .subscribe({
        next: (response) => {
          console.log('=== RESPUESTA EXITOSA ===');
          console.log(response);
          this.alertService.success('Requisición creada exitosamente');
        },
        error: (error) => {
          console.log('=== ERROR ===');
          console.log(error);
          this.alertService.error('Error al crear requisición');
        },
      });
  }

  // Add these helper methods:
  resetForm(): void {
    // Reset form to initial state
    if (this['formGroup']) {
      this['formGroup'].reset({
        ct_area_id: this['selectedArea']?.id_area,
        justificacion: 'Requisición generada desde el sistema',
      });
    }
    // Clear selections
    this.selectedProduct = null;
    this.initMonthlyQuantities();
  }

  reloadData(): void {
    // Reload any data needed after form submission
    this.loadInitialData();
  }

  updateProductSelection(event: any): void {
    console.log('Selección de producto cambiada:', event);

    // Si no hay valor seleccionado
    if (!event.value) {
      this.selectedProduct = null;
      this.initMonthlyQuantities();
      return;
    }

    // Buscar el producto seleccionado por ID
    const productId = event.value;
    const selectedProduct = this.productsOriginal.find(
      (p) => p.id_producto === productId
    );

    if (selectedProduct) {
      console.log('Producto seleccionado:', selectedProduct);
      this.selectedProduct = selectedProduct;
      // Reinicializar cantidades mensuales
      this.initMonthlyQuantities();
    } else {
      console.error('Producto no encontrado en la lista original:', productId);
      this.error = `Error: No se pudo encontrar el producto con ID ${productId}`;
      setTimeout(() => (this.error = null), 3000);
    }
  }

  saveJustificacionesPorPartida(
    requisiciones: { ct_partida_id: number; ct_area_id: number }[],
    justificacion: string,
    usuarioId: number
  ) {
    const partidasUnicas = Array.from(
      new Map(
        requisiciones.map((r) => [`${r.ct_partida_id}-${r.ct_area_id}`, r])
      ).values()
    );
    const justificacionesObservables = partidasUnicas.map((r) =>
      this['saveJustificacion'](
        r.ct_partida_id,
        r.ct_area_id,
        justificacion,
        usuarioId
      )
    );
    return forkJoin(justificacionesObservables);
  }

  // Cambia los getters a métodos públicos para evitar el error de index signature
  isPartidaEnabled(): boolean {
    const desc = this.requisitionForm.get('descripcionProyecto')?.value;
    return !!desc && desc.trim().length > 0;
  }
  isProductoEnabled(): boolean {
    return !!this.selectedItemId && this.isPartidaEnabled();
  }
  isJustificacionEnabled(): boolean {
    return true;
  }
  isCantidadMensualEnabled(): boolean {
    const just = this.requisitionForm.get('justificacion')?.value;
    return !!this.selectedProduct && !!just && just.trim().length > 0;
  }
  // Helper methods for budget visualization with dual rendering mode
  getBudgetPercentage(): number {
    const montoAsignado =
      this.originalMontoAsignado || this.proyectoAnual?.monto_asignado || 0;
    if (montoAsignado === 0) return 0;

    const montoUtilizado = this.montoUtilizadoDisplay;
    return Math.min((montoUtilizado / montoAsignado) * 100, 100);
  }

  getProgressBarWidth(): string {
    return `${this.getBudgetPercentage()}%`;
  }

  getBudgetStatusClass(): string {
    const percentage = this.getBudgetPercentage();
    if (percentage >= 100) return 'bg-danger';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  }

  /**
   * Activa el modo reactivo cuando el usuario comienza a agregar requisiciones
   */
  private activateReactiveMode(): void {
    if (!this.isReactiveMode) {
      this.isReactiveMode = true;
      console.log(
        '🔄 Modo reactivo activado - Los montos se calcularán en tiempo real'
      );
    }
  }

  /**
   * Desactiva el modo reactivo y vuelve a mostrar valores de la BD
   */
  private deactivateReactiveMode(): void {
    if (this.isReactiveMode) {
      this.isReactiveMode = false;
      console.log(
        '📊 Modo estático activado - Los montos se muestran desde la base de datos'
      );
    }
  }

  /**
   * Verifica si debe activar el modo reactivo basado en si hay productos en la requisición
   */
  private checkReactiveModeActivation(): void {
    if (this.selectedProducts.length > 0 && this.currentRequisitionTotal > 0) {
      this.activateReactiveMode();
    } else {
      this.deactivateReactiveMode();
    }
  }

  // ✅ AÑADIR: Debug para verificar área en cualquier momento
  debugCurrentArea(): void {
    console.log('=== DEBUG ÁREA ACTUAL ===');
    console.log('Budget Item ID Techo:', this.budgetItem?.idTecho);
    console.log('Budget Item Unidad:', this.budgetItem?.unidad);
    console.log(
      'Formulario ct_area_id:',
      this.requisitionForm.get('ct_area_id')?.value
    );
    console.log('Áreas originales disponibles:', this.areasOriginal.length);
    if (this.areasOriginal.length > 0) {
      console.log('Primera área como ejemplo:', this.areasOriginal[0]);
    }
    console.log('=========================');
    console.log('Budget Item Unidad:', this.budgetItem?.unidad);
    console.log(
      'Formulario ct_area_id:',
      this.requisitionForm.get('ct_area_id')?.value
    );
    console.log('Áreas originales disponibles:', this.areasOriginal.length);
    if (this.areasOriginal.length > 0) {
      console.log('Primera área como ejemplo:', this.areasOriginal[0]);
    }
    console.log('=========================');
  }

  // Método para inicializar los valores del presupuesto
  private initializeBudgetValues(): void {
    if (this.budgetItem) {
      this.originalMontoAsignado = this.budgetItem.presupuestado || 0;
      this.originalMontoUtilizado = this.proyectoAnual?.monto_utilizado || 0;
      this.currentRequisitionTotal = this.calculateTotalCost();
    }
  }
}
