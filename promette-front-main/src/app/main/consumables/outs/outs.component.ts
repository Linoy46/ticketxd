import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NgbDropdownModule,
  NgbPopoverModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectChangeEvent } from 'primeng/select';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  DatatableComponent,
  SortType,
} from '@swimlane/ngx-datatable';
import { ButtonModule } from 'primeng/button';

import { OutsService } from './services/outs.service';
import { OutsUtilsService } from './services/outs-utils.service';
import { AreasService, Area } from './services/areas.service';
import { AddAreaModalComponent } from './add-area-modal/add-area-modal.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { FormComponent } from './form/form.component';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { AuthLoginService } from '../../auth/services/auth.login.service';

import { Inventario } from '../inventories/interfaces/inventories.interface';

import {
  DatosFactura,
  ProductoSeleccionado,
  RegistroSalida,
  EntregaFormatoInput,
} from './interfaces/outs.interface';

import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';

@Component({
  selector: 'app-outs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbPopoverModule,
    SelectModule,
    DropdownModule,
    FormComponent,
    TutorialComponent,
    ButtonModule,
    AddAreaModalComponent,
    SharedCustomModalComponent,
  ],
  templateUrl: './outs.component.html',
  styleUrls: ['./outs.component.scss'],
})
export class OutsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Agregar referencia a la tabla si se está usando paginación
  @ViewChild('outsTable') table?: DatatableComponent;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Selección de área',
        element: '#area',
        intro:
          'Selecciona el área desde donde se realizará la salida de inventario.',
        position: 'bottom',
      },
      {
        title: 'Datos de producto',
        element: '#factura',
        intro: 'Agregar factura y partida para seleccionar algun producto.',
        position: 'left',
      },
      {
        title: 'Datos de producto',
        element: '#factura',
        intro: 'Agregar factura y partida para seleccionar algun producto.',
        position: 'left',
      },
      {
        title: 'Botón de agregar',
        element: '#nuevo',
        intro: 'Agregar el producto seleccionado.',
        position: 'left',
      },
      {
        title: 'Descripción del producto',
        element: '#descripcion',
        intro: 'Muestra una descripción del producto agregado',
        position: 'bottom',
      },
      {
        title: 'Mes de la operación',
        element: '#mes',
        intro: 'Registra el mes en el que se realiza la operación',
        position: 'right',
      },
      {
        title: 'Persona quien recibe',
        element: '#recibe',
        intro: 'Agregar el nombre de la persona que recibe la salida',
        position: 'left',
      },
      {
        title: 'Observaciones',
        element: '#observaciones',
        intro: 'Agregar observaciones adicionales sobre la entrega (opcional)',
        position: 'top',
      },
      {
        title: 'Botón de cancelar',
        element: '#cancelar',
        intro: 'Cancela la operación de las salidas',
        position: 'right',
      },
      {
        title: 'Botón de enviar',
        element: '#enviar',
        intro: 'Envia la salida registrada',
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

  // Áreas
  areas: Area[] = [];
  areaSeleccionada: Area | null = null;

  inventarioData: Inventario[] = [];
  productosSeleccionados: ProductoSeleccionado[] = [];
  partidaSeleccionada: number | null = null;
  facturaSeleccionada: number | null = null;

  // Nuevos campos para formato (reemplazan el modal)
  formatoData = {
    mes_cantidad: '',
    persona_recibe: '',
    observaciones: '',
  };

  partidas: { id_partida: number; partida: string; nombre: string }[] = [];
  factura: { id_Factura: number; folio: string; id_partida: number }[] = [];
  partidasFiltradas: { id_partida: number; partida: string; nombre: string }[] =
    [];
  filteredProductos: Inventario[] = [];
  productoSeleccionado: Inventario | null = null;
  requiereFactura: 'si' | 'no' = 'no';
  datosFactura: DatosFactura = {
    razonSocial: '',
    rfc: '',
    direccionFiscal: '',
  };
  codigoBarras = '';

  // Para usar Math en el template
  Math = Math;
  loading = false;

  @ViewChild(FormComponent) formComponent!: FormComponent;
  @ViewChild('pdfModal') pdfModal!: ElementRef;

  // Nueva propiedad para manejar la URL segura del PDF
  pdfSrc: SafeResourceUrl | null = null;
  pdfTitle: string = 'Formato de Entrega';

  // Paginación
  limit = 10;
  offset = 0;
  filteredData: Inventario[] = [];

  private currentUserId: number | null = null;

  // Selector de Redux para obtener el usuario autenticado
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  // Getter para acceder al usuario de forma reactiva
  get user() {
    return this.userSelector();
  }

  constructor(
    private outsService: OutsService,
    private outsUtilsService: OutsUtilsService,
    private areasService: AreasService,
    private modalService: CoreModalService,
    private router: Router,
    private alertService: CoreAlertService,
    private modalService2: NgbModal, // Servicio de modals de NgBootstrap
    private sanitizer: DomSanitizer, // Sanitizer para URLs seguras
    private authService: AuthLoginService // <-- inyecta el servicio de autenticación
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.formatoData.mes_cantidad = this.outsUtilsService.formatMesAno();

    // Obtener el usuario desde Redux
    const currentUser = this.user;

    if (currentUser && currentUser.id_usuario) {
      this.currentUserId = currentUser.id_usuario;
      this.outsService.setCurrentUserId(currentUser.id_usuario);
      console.log('✅ Usuario obtenido correctamente:', {
        id_usuario: currentUser.id_usuario,
        nombre: currentUser.nombre_usuario || currentUser.name
      });
    } else {
      // Si no hay usuario en Redux, intentar con localStorage como fallback
      console.log('⚠️ No hay usuario en Redux, verificando localStorage...');

      let fallbackUser = null;
      try {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          fallbackUser = JSON.parse(authUser);
        }
      } catch (error) {
        console.error('Error parsing authUser from localStorage:', error);
      }

      const userId = fallbackUser?.id_usuario || fallbackUser?.id || null;
      if (userId) {
        this.currentUserId = userId;
        this.outsService.setCurrentUserId(userId);
        console.log('✅ Usuario obtenido desde localStorage:', userId);
      } else {
        this.currentUserId = null;
        console.error('❌ No se pudo obtener el usuario autenticado');
        this.alertService.warning(
          'No se pudo obtener el usuario autenticado. Por favor, vuelve a iniciar sesión.'
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos necesarios para el componente
   */
  private loadData(): void {
    this.loadAreas();
    this.loadInventoryData();
    this.loadPartidas();
    this.loadFacturas();
  }

  /**
   * Carga datos de áreas desde el servicio
   */
  private loadAreas(): void {
    this.areasService
      .getAllAreas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areas) => {
          this.areas = areas;
        },
        error: (err) => {
          this.alertService.error('Error al cargar las áreas');
        },
      });
  }

  /**
   * Carga datos de inventario desde el servicio
   */
  private loadInventoryData(): void {
    this.outsService
      .getAllInventory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.inventarioData = data.map((item) => ({
            ...item,
            // Asegurar que descripcion está disponible (algunos registros usan description)
            descripcion: item.descripcion || item.description || '',
            cantidad:
              typeof item.resta === 'number'
                ? item.resta
                : parseInt(item.resta || '0', 10),
            // Normalizar IDs de partida
            id_partida: item.id_partida || item.ct_partida_id || 0,
            ct_partida_id: item.ct_partida_id || item.id_partida || 0,
          }));

          this.filtrarProductosPorPartida(this.partidaSeleccionada);
        },
        error: (err) => {
          this.alertService.error('Error al cargar datos de inventario');
        },
      });
  }

  /**
   * Carga datos de partidas desde el servicio
   */
  private loadPartidas(): void {
    this.outsService
      .getAllPartidas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.partidas = items.map((item) => {
            // Quitar el 4to caracter de la clave
            let claveOriginal = item.clave || '';
            let claveSinCuartoCaracter = '';
            if (claveOriginal.length >= 5) {
              claveSinCuartoCaracter = claveOriginal.slice(0, 3) + claveOriginal.slice(4);
            } else {
              claveSinCuartoCaracter = claveOriginal;
            }
            return {
              id_partida: item.id_partida,
              partida: claveSinCuartoCaracter,
              nombre: item.nombre || '',
            };
          });
        },
        error: (err) => {
          this.alertService.error('Error al cargar datos de partidas');
        },
      });
  }

  /**
   * Carga datos de facturas desde el servicio
   */
  private loadFacturas(): void {
    this.outsService
      .getAllFacturas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoices) => {
          this.factura = invoices.map((factura) => {
            let partidaId = 0;
            const facturaAny = factura as any;

            if (
              facturaAny.dt_consumible_inventarios &&
              Array.isArray(facturaAny.dt_consumible_inventarios) &&
              facturaAny.dt_consumible_inventarios.length > 0
            ) {
              const primerInventario = facturaAny.dt_consumible_inventarios[0];
              partidaId = primerInventario?.ct_partida_id || 0;
            }

            return {
              id_Factura: factura.id_factura,
              folio: factura.factura,
              id_partida: partidaId,
            };
          });
        },
        error: (err) => {
          this.alertService.error('Error al cargar datos de facturas');
        },
      });
  }

  /**
   * Maneja el cambio de área seleccionada
   */
  onAreaChange(event: SelectChangeEvent): void {
    const area = this.areas.find((a) => a.id_area === event.value);
    this.areaSeleccionada = area || null;

    // Resetear campos dependientes como antes lo hacía onDepartmentChange
    this.partidaSeleccionada = null;
    this.productoSeleccionado = null;
    this.filteredProductos = [];
    this.facturaSeleccionada = null;
    this.partidasFiltradas = [];
  }

  /**
   * Obtiene el texto completo de jerarquía para mostrar
   * @param area Área con la información completa
   * @returns String con formato "Dirección → Departamento → Área"
   */
  getAreaDisplayText(area: Area): string {
    return this.areasService.getAreaDisplayText(area);
  }

  /**
   * Abre el modal para agregar una nueva área
   */
  openAddAreaModal(): void {
    console.log('Abriendo modal de nueva área...');
    try {
      this.modalService.open(AddAreaModalComponent, 'Agregar Nueva Área', {
        onAreaCreated: (newArea: Area) => {
          console.log('Área creada:', newArea);
          this.modalService.close();
          this.alertService.success('Área creada correctamente');
          // Recargar las áreas para incluir la nueva
          this.loadAreas();
          // Opcional: seleccionar automáticamente la nueva área
          setTimeout(() => {
            this.areaSeleccionada = newArea;
          }, 500);
        },
        onCancel: () => {
          console.log('Modal cancelado');
          this.modalService.close();
        },
      });
    } catch (error) {
      console.error('Error abriendo modal:', error);
      this.alertService.error('Error al abrir el modal');
    }
  }

  /**
   * Maneja el cambio de factura seleccionada
   * Filtra las partidas según la factura
   */
  onFacturaChange(event: DropdownChangeEvent): void {
    const id_factura = event.value;
    this.partidaSeleccionada = null;
    this.filteredProductos = [];

    if (!id_factura) {
      this.partidasFiltradas = [];
      return;
    }

    const fact = this.factura.find((f) => f.id_Factura === id_factura);
    this.partidasFiltradas = fact
      ? this.partidas.filter((p) => p.id_partida === fact.id_partida)
      : [];
  }

  /**
   * Maneja el cambio de partida seleccionada
   * Filtra productos por partida
   */
  onPartidaChange(event: DropdownChangeEvent): void {
    const id_partida = event.value;

    // Limpiar productos ya seleccionados si la partida cambia
    if (this.productosSeleccionados.length > 0) {
      this.alertService
        .confirm(
          'Cambiar la partida eliminará los productos seleccionados. ¿Desea continuar?'
        )
        .then((result) => {
          if (result.isConfirmed) {
            this.productosSeleccionados = [];
            this.filtrarProductosPorPartida(id_partida);
          } else {
            // Revertir la selección de partida
            setTimeout(() => {
              this.partidaSeleccionada =
                this.productosSeleccionados[0]?.ct_partida_id ||
                this.productosSeleccionados[0]?.id_partida ||
                null;
            });
          }
        });
    } else {
      this.filtrarProductosPorPartida(id_partida);
    }
  }

  /**
   * Filtra productos por la partida seleccionada
   */
  private filtrarProductosPorPartida(id_partida: number | null): void {
    if (id_partida) {
      // Filtrar considerando tanto ct_partida_id como id_partida
      this.filteredProductos = this.inventarioData.filter(
        (p) =>
          (p.ct_partida_id === id_partida || p.id_partida === id_partida) &&
          // Solo mostrar productos con existencia > 0
          (p.cantidad > 0 || parseInt(p.resta?.toString() || '0', 10) > 0)
      );

      if (this.filteredProductos.length === 0) {
        this.alertService.warning(
          'No hay productos disponibles para esta partida'
        );
      }
    } else {
      // Si no hay partida seleccionada, mostrar todos los productos con existencia
      this.filteredProductos = this.inventarioData.filter(
        (p) => p.cantidad > 0 || parseInt(p.resta?.toString() || '0', 10) > 0
      );
    }
  }

  /**
   * Agrega un producto al carrito de compras
   * Verifica que todos pertenezcan a la misma partida
   */
  handleAgregarProducto(prod: Inventario): void {
    const cantidadDisponible =
      prod.cantidad || parseInt(prod.resta?.toString() || '0', 10);

    if (cantidadDisponible <= 0) {
      this.alertService.warning(
        `El producto ${
          prod.descripcion || prod.description
        } no tiene existencias disponibles`
      );
      return;
    }

    // Verificar si ya hay productos de otra partida
    if (this.productosSeleccionados.length > 0) {
      const partidaActual =
        this.productosSeleccionados[0].ct_partida_id ||
        this.productosSeleccionados[0].id_partida;
      const partidaNueva = prod.ct_partida_id || prod.id_partida;

      if (partidaActual !== partidaNueva) {
        this.alertService.warning(
          'Solo se pueden agregar productos de la misma partida en cada formato'
        );
        return;
      }
    } else if (!this.partidaSeleccionada) {
      // Si no hay partida seleccionada pero es el primer producto, asignar su partida
      this.partidaSeleccionada = prod.ct_partida_id || prod.id_partida || null;
    }

    const existe = this.productosSeleccionados.find(
      (p) => p.id_inventario === prod.id_inventario
    );

    if (existe) {
      if (existe.cantidadSeleccionada! < cantidadDisponible) {
        existe.cantidadSeleccionada!++;
        existe.errorMessage = undefined;
        this.alertService.success(
          `Se incrementó la cantidad de ${prod.descripcion || prod.description}`
        );
      } else {
        existe.errorMessage = `Máximo: ${cantidadDisponible}`;
        this.alertService.warning(
          `No se puede agregar más del disponible (${cantidadDisponible})`
        );
      }
    } else {
      // Normalizar el ID de unidad antes de añadir
      const unidadId = prod.ct_unidad_id || prod.id_unidad_medida || 1;

      this.productosSeleccionados.push({
        ...prod,
        cantidadSeleccionada: 1,
        errorMessage: undefined,
        ct_unidad_id: unidadId,
      });

      this.alertService.success(
        `Producto agregado: ${prod.descripcion || prod.description}`
      );
    }
  }

  /**
   * Elimina un producto de la lista de seleccionados
   */
  handleEliminarProducto(id_inventario: number): void {
    this.productosSeleccionados = this.productosSeleccionados.filter(
      (p) => p.id_inventario !== id_inventario
    );
  }

  /**
   * Cambia la cantidad de un producto seleccionado
   * Valida que no exceda el máximo disponible
   */
  handleCambiarCantidad(id_inventario: number, value: number): void {
    const prod = this.productosSeleccionados.find(
      (p) => p.id_inventario === id_inventario
    );
    if (!prod) return;

    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > prod.cantidad) {
      qty = prod.cantidad;
      prod.errorMessage = `Máximo: ${prod.cantidad}`;
    } else {
      prod.errorMessage = undefined;
    }
    prod.cantidadSeleccionada = qty;
  }

  /**
   * Maneja el escaneo de código de barras
   * Busca el producto por su folio y lo agrega si existe
   */
  handleEscanearCodigo(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.codigoBarras.trim()) {
      const encontrado = this.inventarioData.find(
        (p) => p.folio === this.codigoBarras.trim()
      );
      if (encontrado) {
        this.handleAgregarProducto(encontrado);
      } else {
        this.alertService.warning('Producto no encontrado');
      }
      this.codigoBarras = '';
    }
  }

  /**
   * Obtiene el nombre del área seleccionada
   */
  getAreaNombre(id: number): string {
    const area = this.areas.find((a) => a.id_area === id);
    return area ? area.nombre : 'Sin asignar';
  }

  /**
   * Obtiene el folio de una factura por su ID
   */
  getFacturaFolio(id?: number | null): string {
    if (!id) return '';
    const f = this.factura.find((x) => x.id_Factura === id);
    return f?.folio || '';
  }

  /**
   * Obtiene el nombre de una partida por su ID
   */
  getPartidaNombre(id: number | undefined): string {
    if (id === undefined || id === null) return '';
    const p = this.partidas.find((x) => x.id_partida === id);
    return p?.nombre || '';
  }

  /**
   * Obtiene el número de una partida por su ID, quitando el 4to caracter
   */
  getPartidaNumero(id: number | undefined): string {
    if (id === undefined || id === null) return '';
    const p = this.partidas.find((x) => x.id_partida === id);
    if (!p?.partida) return '';
    // Quitar el 4to caracter si la longitud es al menos 5
    const partida = p.partida;
    if (partida.length >= 5) {
      return partida.slice(0, 3) + partida.slice(4);
    }
    return partida;
  }

  /**
   * Maneja el cambio de producto seleccionado en el dropdown
   */
  onProductoChange(event: DropdownChangeEvent): void {
    // Método para manejar el cambio de producto en dropdown
  }

  /**
   * Agrega el producto seleccionado en el dropdown a la lista
   */
  handleAgregarProductoSeleccionado(): void {
    if (!this.productoSeleccionado) {
      this.alertService.warning('Por favor seleccione un producto primero');
      return;
    }

    this.handleAgregarProducto(this.productoSeleccionado);
    this.productoSeleccionado = null;
  }

  /**
   * Maneja el evento de envío del formulario
   * Muestra una confirmación antes de enviar los datos
   */
  handleSubmit(): void {
    if (
      this.productosSeleccionados.length === 0 ||
      !this.areaSeleccionada ||
      !this.formatoData.persona_recibe.trim()
    ) {
      this.alertService.warning(
        'Por favor complete todos los campos requeridos (área y persona que recibe)'
      );
      return;
    }
    this.alertService
      .confirm('¿Desea generar esta salida de inventario?')
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, proceder con el envío
          this.procesarEnvio();
        }
      });
  }

  /**
   * Procesa el envío de datos al servidor
   */
  private procesarEnvio(): void {
    // Creamos el objeto de registro que se enviará al backend
    const registroSalida: RegistroSalida = {
      id_area: this.areaSeleccionada!.id_area,
      productos: this.productosSeleccionados.map((p) => ({
        id_inventario: p.id_inventario,
        cantidad: p.cantidadSeleccionada || 0,
        ct_unidad_id: p.ct_unidad_id || p.id_unidad_medida || 1,
      })),
      //ct_usuario_id: this.currentUserId ?? 1,
      ct_usuario_id: this.user.id_usuario ?? 1,
      observaciones: this.formatoData.observaciones.trim() || undefined,
    };
    this.loading = true;

    // Enviamos los datos al servidor
    this.outsService
      .registerInventoryExit(registroSalida)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Si se crearon entregas con éxito, crear el formato directamente
          if (response.success && response.data?.entregas_ids?.length > 0) {
            this.crearFormato(response.data.entregas_ids);
          } else {
            this.loading = false;
            this.alertService.success('Salidas registradas correctamente');
            this.handleCancel(); // Limpiar el formulario
          }
        },
        error: (err) => {
          this.loading = false;
          this.alertService.error(
            'Error al registrar la salida: ' +
              (err.error?.msg || 'Contacte al administrador')
          );
        },
      });
  }

  /**
   * Crea el formato de entrega con los datos proporcionados
   */
  private crearFormato(entregasIds: number[]): void {
    // Preparar datos para el formato
    const formatoInput: EntregaFormatoInput =
      this.outsUtilsService.prepareFormatoData(
        this.formatoData,
        this.currentUserId ?? 0, // Use 0 as fallback if null
        entregasIds
      );

    // Llamar al servicio para crear el formato
    this.outsService
      .createEntregaFormato(formatoInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.alertService.success('Formato de entrega creado correctamente');

          // Obtener el folio del formato creado
          const folioFormato = response.formato?.folio_formato;

          if (folioFormato) {
            // Generar el PDF
            this.generarPdf(folioFormato);
          }

          // Limpiar el formulario
          this.handleCancel();

          // Recargar datos de inventario para reflejar los cambios
          this.loadInventoryData();
        },
        error: (err) => {
          this.loading = false;
          this.alertService.error(
            'Error al crear el formato de entrega: ' +
              (err.error?.msg || 'Contacte al administrador')
          );
        },
      });
  }

  /**
   * Genera el PDF de formato de entrega y lo muestra en un modal
   */
  private generarPdf(folioFormato: string): void {
    try {
      this.loading = true;

      // Usar directamente el servicio de generación de PDF
      this.outsService.generateEntregaPDF(folioFormato).subscribe({
        next: (blob: Blob) => {
          this.loading = false;

          // Crear la URL del blob
          const blobUrl = URL.createObjectURL(blob);

          // Crear una URL segura para el iframe
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

          // Establecer el título del PDF
          this.pdfTitle = `Formato de Entrega ${folioFormato}`;

          // Abrir el modal
          if (this.pdfModal) {
            this.openPdfModal(this.pdfModal);
          } else {
            console.error('No se encontró la referencia al modal');
            // Fallback: abrir en nueva ventana
            window.open(blobUrl, '_blank');
          }
        },
        error: (error) => {
          this.loading = false;
          this.alertService.warning('Error al generar el PDF');
          console.error('Error al generar el PDF:', error);
        },
      });
    } catch (error) {
      this.loading = false;
      console.error('Error al generar el PDF:', error);
      this.alertService.warning(
        'El formato se creó correctamente pero hubo un problema al generar el PDF'
      );
    }
  }

  /**
   * Abre el modal con el PDF
   */
  openPdfModal(content: any) {
    this.modalService2.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      backdrop: 'static',
    });
  }

  /**
   * Limpia recursos al cerrar el modal
   */
  onModalClose() {
    if (this.pdfSrc) {
      // Extraer la URL del blob para revocarla
      const blobUrl = this.pdfSrc.toString();
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      this.pdfSrc = null;
    }
  }

  /**
   * Descarga el PDF actual
   */
  downloadCurrentPdf() {
    if (!this.pdfSrc) return;

    try {
      // Obtener la URL del blob del iframe
      const blobUrl = this.pdfSrc.toString();

      // Crear una nueva solicitud para obtener el PDF fresco
      const folioFormato = this.pdfTitle
        .replace('Formato de Entrega ', '')
        .trim();

      this.loading = true;
      this.outsService.generateEntregaPDF(folioFormato).subscribe({
        next: (blob: Blob) => {
          this.loading = false;

          // Crear una URL para el nuevo blob
          const url = window.URL.createObjectURL(blob);

          // Crear un elemento <a> para descargar
          const link = document.createElement('a');
          link.href = url;
          link.download = `Formato_Entrega_${folioFormato.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}.pdf`;
          document.body.appendChild(link);

          // Simular clic y luego eliminar el elemento
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        },
        error: (error) => {
          this.loading = false;
          this.alertService.warning('Error al descargar el PDF');
          console.error('Error al descargar el PDF:', error);
        },
      });
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      this.alertService.warning('Error al descargar el PDF');
    }
  }

  /**
   * Cancela la operación y resetea el formulario
   */
  handleCancel(): void {
    this.areaSeleccionada = null;
    this.partidaSeleccionada = null;
    this.facturaSeleccionada = null;
    this.productosSeleccionados = [];
    this.filteredProductos = [...this.inventarioData];
    this.codigoBarras = '';
    // Resetear los campos del formato pero mantener el mes actual
    this.formatoData = {
      mes_cantidad: this.outsUtilsService.formatMesAno(), // Solo el mes sin año
      persona_recibe: '',
      observaciones: '',
    };
  }

  /**
   * Maneja el evento de cambio del mes en el formato
   */
  onMesChange(event: any): void {
    const nuevoMes = event.value;
    if (nuevoMes) {
      this.formatoData.mes_cantidad = nuevoMes;
    }
  }

  // Si existe una tabla con paginación, agregar estos métodos para manejarla
  // Si no lo tiene, omite esta parte
  isActivePage(pageNumber: number): boolean {
    return this.offset === pageNumber;
  }

  setPage(pageNumber: number): void {
    if (this.table) {
      this.table.offset = pageNumber;
    }
    this.offset = pageNumber;
  }

  getPaginationPages(): number[] {
    if (!this.filteredData || this.filteredData.length === 0) return [];

    const pageCount = Math.ceil(this.filteredData.length / this.limit);
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const halfWay = Math.floor(maxPagesToShow / 2);
    let start = this.offset - halfWay;

    if (start < 0) {
      start = 0;
    } else if (start + maxPagesToShow > pageCount) {
      start = pageCount - maxPagesToShow;
    }

    return Array.from(
      { length: Math.min(maxPagesToShow, pageCount) },
      (_, i) => start + i
    );
  }

  // Añadir métodos de paginación si la página usa una tabla con paginación
  // Si no los tiene, agrégalos según sea necesario
}
