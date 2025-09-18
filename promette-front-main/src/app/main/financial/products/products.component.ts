import {
  Component,
  type OnInit,
  OnDestroy,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, combineLatest, map } from 'rxjs';
import {
  Product,
  Item,
  MeasurementUnit,
  CreateProductDto,
} from './interfaces/products.interface';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { FormComponent } from './form/form/form.component';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { ProductsService } from './services/products.service';
import { FilterService } from './services/filter.service';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { localeText } from '../../../core/helpers/localText';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { FinancingService } from '../financing/services/financing.service';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

// Registrar los módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    NgbDropdownModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SelectModule,
    DropdownModule,
    SharedActionsGridComponent,
    TutorialComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  @Input() focusField: string | undefined;

  @ViewChild('nombreField') nombreField: any;
  @ViewChild('precioField') precioField: any;
  @ViewChild('partidaField') partidaField: any;
  @ViewChild('unidadField') unidadField: any;
  ngAfterViewInit(): void {
    this.setResponsiveColumns();
    window.addEventListener('resize', () => this.setResponsiveColumns());
    setTimeout(() => {
      switch (this.focusField) {
        case 'nombre':
          this.nombreField?.control?.nativeElement?.focus();
          break;
        case 'precio':
          this.precioField?.control?.nativeElement?.focus();
          break;
        case 'partida':
          this.partidaField?.focus?.();
          break;
        case 'unidad':
          this.unidadField?.focus?.();
          break;
      }
    }, 100);
  }

  setResponsiveColumns(): void {
    if (window.innerWidth < 768) {
      // Configuración específica para móviles - exactamente 3 columnas visibles
      this.columnDefs = [
        {
          field: 'id',
          headerName: 'ID',
          flex: 1,
          minWidth: 120,
          maxWidth: 140,
          filter: true,
          sortable: true,
        },
        {
          field: 'nombre',
          headerName: 'Nombre',
          flex: 1,
          minWidth: 120,
          maxWidth: 140,
          filter: true,
          sortable: true,
        },
        {
          field: 'precio',
          headerName: 'Precio',
          flex: 1,
          minWidth: 120,
          maxWidth: 140,
          filter: true,
          sortable: true,
          valueFormatter: (params) => this.formatCurrency(params.value),
        },
        {
          field: 'partida',
          headerName: 'Partida',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
          filter: true,
          sortable: true,
        },
        {
          field: 'unidad',
          headerName: 'Unidad',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
          filter: true,
          sortable: true,
          valueGetter: (params) => {
            const product = params.data.originalData;
            if (!product || !product.ct_unidad_id) return 'No asignada';

            const unidad = this.unidades.find(
              (u) => u.id_unidad === product.ct_unidad_id
            );
            if (!unidad) return 'No asignada';

            return unidad.clave_unidad && unidad.clave_unidad.trim() !== ''
              ? unidad.clave_unidad
              : unidad.nombre_unidad || 'Sin nombre';
          },
        },
        {
          field: 'estado',
          headerName: 'Estado',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
          filter: true,
          sortable: true,
          cellRenderer: (params: any) => {
            return params.value == 1
              ? '<span id="estado" class="badge bg-success">Activo</span>'
              : '<span id="estado" class="badge bg-danger">Inactivo</span>';
          },
        },
        ...(this.hasPermission('Financieros:view_actions_ct_productos')
          ? [
              {
                headerName: 'Acciones',
                filter: false,
                sortable: false,
                cellRenderer: SharedActionsGridComponent,
                cellRendererParams: {
                  onEdit: this.openEditDialog.bind(this),
                  onDelete: this.openDeleteDialog.bind(this),
                },
                minWidth: 110,
                maxWidth: 130,
              },
            ]
          : []),
      ];
    } else {
      // Configuración para pantallas grandes (original)
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      this.columnDefs = [
        {
          field: 'id',
          headerName: 'ID',
          maxWidth: 100,
          minWidth: 80,
          filter: true,
          sortable: true,
        },
        {
          field: 'nombre',
          headerName: 'Nombre',
          flex: 2,
          minWidth: 320,
          filter: true,
          sortable: true,
        },
        {
          field: 'precio',
          headerName: 'Precio',
          flex: 1,
          minWidth: 120,
          filter: true,
          sortable: true,
          valueFormatter: (params) => this.formatCurrency(params.value),
        },
        {
          field: 'partida',
          headerName: 'Partida',
          flex: 1.5,
          minWidth: 260,
          filter: true,
          sortable: true,
        },
        {
          field: 'unidad',
          headerName: 'Unidad',
          flex: 0.8,
          minWidth: 120,
          filter: true,
          sortable: true,
          valueGetter: (params) => {
            const product = params.data.originalData;
            if (!product || !product.ct_unidad_id) return 'No asignada';

            const unidad = this.unidades.find(
              (u) => u.id_unidad === product.ct_unidad_id
            );
            if (!unidad) return 'No asignada';

            return unidad.clave_unidad && unidad.clave_unidad.trim() !== ''
              ? unidad.clave_unidad
              : unidad.nombre_unidad || 'Sin nombre';
          },
        },
        {
          field: 'estado',
          headerName: 'Estado',
          flex: 0.8,
          minWidth: 120,
          filter: true,
          sortable: true,
          cellRenderer: (params: any) => {
            return params.value == 1
              ? '<span id="estado" class="badge bg-success">Activo</span>'
              : '<span id="estado" class="badge bg-danger">Inactivo</span>';
          },
        },
        ...(this.hasPermission('Financieros:view_actions_ct_productos')
          ? [
              {
                headerName: 'Acciones',
                filter: false,
                sortable: false,
                cellRenderer: SharedActionsGridComponent,
                cellRendererParams: {
                  onEdit: this.openEditDialog.bind(this),
                  onDelete: this.openDeleteDialog.bind(this),
                },
                maxWidth: isTablet ? 150 : 120, //Ancho para Tabletts
                minWidth: isTablet ? 130 : 100,
              },
            ]
          : []),
      ];
    }
  }

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );
  private user$ = injectSelector((state: RootState) => state.auth.user);

  get permissions() {
    return this.permissionsSelector();
  }
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  canSeeActions = false;
  searchTerm = '';

  // Datos para la UI
  products: Product[] = [];
  partidas: Item[] = [];
  unidades: MeasurementUnit[] = [];
  filteredProducts: Product[] = [];
  displayData: any[] = [];
  selected: any[] = [];
  Math = Math;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Nuevo Producto',
        element: '#nuevo_producto',
        intro: 'Haz clic aquí para crear un nuevo producto.',
        position: 'bottom',
      },
      {
        title: 'Tabla de productos',
        element: 'ag-grid-angular',
        intro:
          'Esta tabla muestra todos los productos con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro: 'Utiliza estos filtros para buscar productos específicos.',
        position: 'bottom',
      },
      {
        title: 'Estado del registro',
        element: '#estado',
        intro:
          'Indica el estado de cada producto (<small class="text-success">Activo</small> o <small class="text-danger">Inactivo</small>).',
        position: 'left',
      },
      {
        title: 'Editar producto',
        element: '#editar',
        intro: 'Aquí podrás editar la información del producto seleccionado.',
        position: 'left',
      },
      {
        title: 'Eliminar producto',
        element: '#eliminar',
        intro: 'Aquí podrás eliminar el producto seleccionado',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en productos');
    },
    onExit: () => {
      console.log('Tutorial cerrado en productos');
    },
  };

  currentUserId = 1;

  // Suscripciones para limpiar en ngOnDestroy
  private subscriptions: Subscription[] = [];

  /**
   * Editar producto desde celda de acciones
   * Este método será usado por SharedActionsGridComponent
   */
  editItem = (row: any): void => {
    const product = row.originalData;
    if (product) {
      this.openEditDialog(product);
    }
  };

  /**
   * Eliminar producto desde celda de acciones
   * Este método será usado por SharedActionsGridComponent
   */
  deleteItem = (row: any): void => {
    const product = row.originalData;
    if (product) {
      this.openDeleteDialog(product);
    }
  };

  // Configuración de AG Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  // Opciones de la grid - actualizado para coincidir con el componente de usuarios
  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
    },
    localeText: localeText,
    columnChooser: true,
    floatingFilter: false,
    animateRows: true,
    pagination: true, // Añadir paginación
    paginationPageSize: 10, // Tamaño de la página
  };

  // Definiciones de columnas para AG Grid
  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      maxWidth: 100,
      minWidth: 80,
      filter: true,
      sortable: true,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 2,
      minWidth: 320,
      filter: true,
      sortable: true,
    },
    {
      field: 'precio',
      headerName: 'Precio',
      flex: 1,
      minWidth: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => this.formatCurrency(params.value),
    },
    {
      field: 'partida',
      headerName: 'Partida',
      flex: 1.5,
      minWidth: 260,
      filter: true,
      sortable: true,
    },
    {
      field: 'unidad',
      headerName: 'Unidad',
      flex: 0.8,
      minWidth: 120,
      filter: true,
      sortable: true,
      valueGetter: (params) => {
        const product = params.data.originalData;
        if (!product || !product.ct_unidad_id) return 'No asignada';

        const unidad = this.unidades.find(
          (u) => u.id_unidad === product.ct_unidad_id
        );
        if (!unidad) return 'No asignada';

        // Mostrar clave_unidad si existe, de lo contrario mostrar nombre_unidad
        return unidad.clave_unidad && unidad.clave_unidad.trim() !== ''
          ? unidad.clave_unidad
          : unidad.nombre_unidad || 'Sin nombre';
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 0.8,
      minWidth: 120,
      filter: true,
      sortable: true,
      cellRenderer: (params: any) => {
        return params.value == 1
          ? '<span id="estado" class="badge bg-success">Activo</span>'
          : '<span id="estado" class="badge bg-danger">Inactivo</span>';
      },
    },
    ...(this.hasPermission('Financieros:view_actions_ct_productos')
      ? [
          {
            headerName: 'Acciones',
            filter: false,
            sortable: false,
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onEdit: this.openEditDialog.bind(this),
              onDelete: this.openDeleteDialog.bind(this),
            },
            maxWidth: 120,
            minWidth: 100,
          },
        ]
      : []),
  ];

  onCellClicked(event: any): void {
    const col = event.colDef.field;
    const rowData = event.data.originalData;
    if (!rowData) return;

    // Solo abrir el modal de edición si NO es la columna de acciones
    if (col !== 'Acciones') {
      this.openEditDialog(rowData, col);
    }
    // Si quieres mostrar info según la columna, puedes dejar el switch aquí
    switch (col) {
      case 'nombre':
        this.alertService.info(`Nombre: ${rowData.nombre_producto}`);
        break;
      case 'precio':
        this.alertService.info(`Precio: ${rowData.precio}`);
        break;
      case 'partida':
        this.alertService.info(`Partida: ${rowData.ct_partida_id}`);
        break;
      // ...otros casos
      default:
        this.alertService.info(`Columna: ${col}, Valor: ${event.value}`);
    }
  }

  constructor(
    private modalService: CoreModalService,
    public productsService: ProductsService,
    private filterService: FilterService,
    private alertService: CoreAlertService,
    public loadingService: CoreLoadingService,
    private financingService: FinancingService
  ) {}

  /**
   * Inicializar el componente
   */
  ngOnInit(): void {
    // Configurar listeners para eventos personalizados
    document.addEventListener('edit-product', this.handleEditEvent.bind(this));
    document.addEventListener(
      'delete-product',
      this.handleDeleteEvent.bind(this)
    );

    // Inicializar datos
    this.loadData();
    console.log(this.canSeeActions);
    //cargar financieros
    this.loadFinancingData();

    if (window.innerWidth <= 900) {
      // Todas las columnas del mismo tamaño
      this.columnDefs = this.columnDefs.map((col) => ({
        ...col,
        minWidth: 120,
        flex: 1,
      }));
    }
  }

  /**
   * Carga los datos de productos
   */
  loadData(): void {
    // Clear any previous data before loading to prevent UI flicker
    this.displayData = [];

    // Mostrar indicador de carga
    this.loadingService.show();

    // Initialize data - this will trigger the API calls
    this.productsService.initialize();

    // Setup data subscriptions
    this.subscribeToDataChanges();

    // Suscribirse al estado de error del servicio
    const errorSub = this.productsService.error$.subscribe((error) => {
      if (error) {
        this.alertService.error(error);
      }
    });
    this.subscriptions.push(errorSub);
  }

  /**
   * Suscribirse a los observables de datos
   */
  private subscribeToDataChanges(): void {
    // Suscribirse a los productos
    const productsSub = this.productsService.products$.subscribe((products) => {
      this.products = products;
      this.processProductsData();
      // Ocultar indicador de carga cuando los productos estén cargados
      this.loadingService.hide();
    });

    // Suscribirse a las partidas
    const itemsSub = this.productsService.items$.subscribe((items) => {
      this.partidas = items;
      console.log('Partidas cargadas en el componente:', this.partidas);
    });

    // Suscribirse a las unidades de medida
    const unitsSub = this.productsService.units$.subscribe((units) => {
      this.unidades = units;
    });

    // Suscribirse a los productos filtrados
    const filteredProductsSub = combineLatest([
      this.productsService.products$,
      this.filterService.searchTerm$,
      this.filterService.sortBy$,
      this.filterService.sortDirection$,
    ])
      .pipe(
        map(([products, searchTerm, sortBy, sortDirection]) => {
          let filtered = [...products];

          // Aplicar filtro de búsqueda
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
              (product) =>
                product.nombre_producto.toLowerCase().includes(term) ||
                (product.ct_partida?.clave_partida || '')
                  .toLowerCase()
                  .includes(term) ||
                (product.ct_partida?.nombre_partida || '')
                  .toLowerCase()
                  .includes(term) ||
                (product.ct_unidad?.clave_unidad || '')
                  .toLowerCase()
                  .includes(term) ||
                product.precio.toString().includes(term) ||
                product.id_producto.toString().includes(term)
            );
          }

          // Filtro de precio removido completamente

          // Ordenar resultados
          if (sortBy && sortDirection) {
            filtered.sort((a, b) => {
              if (sortBy === 'id_producto') {
                return sortDirection === 'asc'
                  ? a.id_producto - b.id_producto
                  : b.id_producto - a.id_producto;
              } else if (sortBy === 'nombre_producto') {
                return sortDirection === 'asc'
                  ? a.nombre_producto.localeCompare(b.nombre_producto)
                  : b.nombre_producto.localeCompare(a.nombre_producto);
              } else if (sortBy === 'precio') {
                return sortDirection === 'asc'
                  ? a.precio - b.precio
                  : b.precio - a.precio;
              }
              return 0;
            });
          }

          return filtered;
        })
      )
      .subscribe((filteredProducts) => {
        this.filteredProducts = filteredProducts;
        this.processProductsData();
      });

    // Añadir las suscripciones para limpiarlas después
    this.subscriptions.push(
      productsSub,
      itemsSub,
      unitsSub,
      filteredProductsSub
    );
  }

  /**
   * Procesa los datos de productos para la visualización en la tabla
   */
  processProductsData(): void {
    if (!this.filteredProducts || this.filteredProducts.length === 0) {
      this.displayData = [];
      return;
    }

    this.displayData = [];

    this.displayData = this.filteredProducts.map((product) => {
      // Obtener información de partida
      const partida = this.partidas.find(
        (p) => p.id_partida === product.ct_partida_id
      );
      const partidaText = partida
        ? `${partida.clave_partida} - ${partida.nombre_partida}`
        : 'No asignada';

      // Obtener información de unidad
      const unidad = this.unidades.find(
        (u) => u.id_unidad === product.ct_unidad_id
      );
      let unidadText = 'No asignada';

      if (unidad) {
        // Mostrar clave_unidad si existe, de lo contrario mostrar nombre_unidad
        if (unidad.clave_unidad && unidad.clave_unidad.trim() !== '') {
          unidadText = unidad.clave_unidad;
        } else if (unidad.nombre_unidad && unidad.nombre_unidad.trim() !== '') {
          unidadText = unidad.nombre_unidad;
        }
      }

      // Asegurarse de que el estado sea un número (1 o 0)
      const estadoValue =
        typeof product.estado === 'boolean'
          ? product.estado
            ? 1
            : 0
          : Number(product.estado);

      return {
        id: product.id_producto,
        nombre: product.nombre_producto,
        precio: product.precio,
        partida: partidaText,
        unidad: unidadText,
        estado: estadoValue,
        originalData: product,
      };
    });

    console.log('Datos procesados para mostrar:', this.displayData);
  }

  /**
   * Actualiza la lista filtrada cuando cambia el texto de búsqueda
   */
  onSearchChange(): void {
    this.filterService.setSearchTerm(this.searchTerm);
  }

  /**
   * Maneja el cambio de página en AG Grid (reemplaza la función para NgxDatatable)
   * Esta función es llamada por el evento de paginación de AG Grid
   */
  onPageChange(event: any): void {
    // AG Grid maneja internamente la paginación, no necesitamos hacer nada aquí
    console.log('Cambio de página:', event);
  }

  /**
   * Maneja el cambio en la cantidad de elementos por página
   * Esta función sería necesaria si implementamos un selector de tamaño de página personalizado
   */
  onLimitChange(): void {
    // Para AG Grid, se puede acceder a la API de la tabla y actualizar la configuración
    console.log('Cambio en elementos por página');
  }

  /**
   * Maneja el evento de selección de fila
   */
  onSelect(event: any): void {
    if (event?.selected && event.selected.length > 0) {
      const selected = event.selected[0];
      if (selected.originalData) {
        this.openEditDialog(selected.originalData);
      }
    }
  }

  /**
   * Limpiar recursos al destruir el componente
   */
  ngOnDestroy(): void {
    // Remover event listeners
    document.removeEventListener(
      'edit-product',
      this.handleEditEvent.bind(this)
    );
    document.removeEventListener(
      'delete-product',
      this.handleDeleteEvent.bind(this)
    );

    // Cancelar suscripciones
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Manejar evento de edición desde la celda
   */
  handleEditEvent(e: any): void {
    const productId = e.detail;
    const product = this.products.find((p) => p.id_producto === productId);
    if (product) this.openEditDialog(product);
  }

  /**
   * Manejar evento de eliminación desde la celda
   */
  handleDeleteEvent(e: any): void {
    const productId = e.detail;
    const product = this.products.find((p) => p.id_producto === productId);
    if (product) this.openDeleteDialog(product);
  }

  /**
   * Abrir diálogo para añadir un nuevo producto
   */
  openAddDialog(): void {
    const newProduct: CreateProductDto = {
      nombre_producto: '',
      precio: 0,
      ct_unidad_id: 0,
      estado: 1,
      ct_usuario_in: this.currentUserId,
      ct_partida_id: 0,
    };

    console.log('Partidas disponibles al abrir el diálogo:', this.partidas);

    this.modalService.open(FormComponent, 'Agregar nuevo producto', {
      product: newProduct,
      partidas: this.partidas,
      unidades: this.unidades,
      onSave: (product: CreateProductDto) => this.handleAddProduct(product),
    });
  }

  /**
   * Abrir diálogo para editar un producto
   */
  openEditDialog(product: Product, focusField?: string): void {
    this.modalService.open(FormComponent, 'Editar producto', {
      product: { ...product, estado: Number(product.estado) },
      partidas: this.partidas,
      unidades: this.unidades,
      onSave: this.handleEditProduct.bind(this),
      close: () => this.modalService.close(),
      focusField,
    });
  }

  /**
   * Abrir diálogo de confirmación para eliminar un producto
   */
  openDeleteDialog(product: Product): void {
    this.alertService
      .confirm(
        '¿Está seguro que desea eliminar este producto?',
        '¿Confirmar eliminación?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.handleDeleteProduct(product);
        }
      });
  }

  /**
   * Procesar la adición de un producto
   */
  handleAddProduct(product: CreateProductDto): void {
    this.loadingService.show();

    const subscription = this.productsService.createProduct(product).subscribe({
      next: () => {
        this.modalService.close();
        this.alertService.success('Producto agregado correctamente');
        this.loadingService.hide();
      },
      error: (error) => {
        this.alertService.error('Error al agregar el producto');
        this.loadingService.hide();
      },
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Procesar la edición de un producto
   */
  handleEditProduct(product: Product): void {
    this.loadingService.show();

    const updateData = {
      ...product,
      ct_usuario_at: this.currentUserId,
    };

    const subscription = this.productsService
      .updateProduct(product.id_producto, updateData)
      .subscribe({
        next: () => {
          this.modalService.close();
          this.alertService.success('Producto actualizado correctamente');
          this.loadingService.hide();
        },
        error: () => {
          this.alertService.error('Error al actualizar el producto');
          this.loadingService.hide();
        },
      });

    this.subscriptions.push(subscription);
  }

  /**
   * Procesar la eliminación de un producto
   */
  handleDeleteProduct(product: any): void {
    const id = product.id_producto ?? product.id; // Usa id_producto o id
    if (!id) {
      this.alertService.error('No se encontró el ID del producto.');
      return;
    }
    this.loadingService.show();
    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.alertService.success('Producto eliminado correctamente');
        this.loadingService.hide();
        this.productsService.loadAllProducts();
      },
      error: (error) => {
        this.alertService.error('Error al eliminar el producto');
        this.loadingService.hide();
      },
    });
  }

  /**
   * Reiniciar todos los filtros
   */
  handleClearFilters(): void {
    this.searchTerm = '';
    this.filterService.resetFilters();
  }

  formatCurrency(amount: number): string {
    return this.productsService.formatCurrency(amount);
  }

  /**
   * Obtener texto para el estado
   */
  getEstadoText(estado: number): string {
    // Corregir la lógica para que 1 sea 'Activo' y 0 sea 'Inactivo'
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  /**
   * Maneja las acciones del SharedActionsGrid
   */
  onActionClick(event: { action: string; data: any }): void {
    switch (event.action) {
      case 'edit':
        this.editItem(event.data);
        break;
      case 'delete':
        this.deleteItem(event.data);
        break;
      default:
        console.warn('Acción no implementada:', event);
    }
  }

  // select para descargar excel
  selectFinanciamiento: any;
  financiamientos: any[] = [];

  descargarExcel(event: any): void {
    console.log('Descargando Excel de : ', event.value);
  }

  // Cargar datos de financiamiento
  loadFinancingData(): void {
    const user = this.user$();
    if (!user) {
      this.alertService.error('No se pudo obtener la información del usuario');
      return;
    }

    this.financingService.getFinancingItems(user.id).subscribe((element) => {
      this.financiamientos = element.financiamientos;
    });
  }
}
