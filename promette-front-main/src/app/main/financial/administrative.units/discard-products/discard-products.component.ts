import { Component, effect, Input, OnInit } from '@angular/core';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '../services/administrative.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { DropdownModule } from 'primeng/dropdown';
import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../../shared/shared-actions-grid/shared-actions-grid.component';
import { localeText } from '../../../../core/helpers/localText';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'discard-products-components',
  imports: [
    SelectModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    AgGridAngular,
  ],
  templateUrl: './discard-products.component.html',
  styleUrl: './discard-products.component.scss',
})
export class DiscardProductsComponent implements OnInit {
  @Input() dataRow: {
    id_financiero: number;
    id_area_fin: number;
    nombre_area: string;
  } | null = null;

  productos: any; 
  productosArea: any = {};
  productosFiltrados: any[] = [];
  productosRestringidos: any[] = [];

  id_producto_seleccionada: number | null = null;
  displayData: any[] = [];
  tienePartidas: boolean = false; // verificar si el área tiene partidas

  private userSelector = injectSelector<RootState, any>((state) => state.auth);
  get user() {
    return this.userSelector();
  }

  constructor(
    private modalService: CoreModalService,
    private alertService: CoreAlertService,
    private admministrativeService: AdministrativeService
  ) {
    effect(() => {
      const user = this.user;
    });
  }

  ngOnInit() {
    if (this.dataRow?.id_area_fin) {
      // Verificar si el área tiene partidas configuradas
      this.verificarPartidasArea(this.dataRow.id_area_fin);
      this.cargarProductosDescartados(this.dataRow.id_area_fin);
    } else {
      // Cargar todos los productos si no hay área seleccionada
      this.cargarProdutos();
    }
  }

  verificarPartidasArea(idAreaFin: number) {
    // Verificar si el área tiene partidas configuradas
    this.admministrativeService.getProductosPorArea(idAreaFin).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const tienePartidas =
            response.data.partidas && response.data.partidas.length > 0;
          this.tienePartidas = tienePartidas;

          if (tienePartidas) {
            this.productosArea = response.data;
            this.transformarProductosParaDropdown(response.data);
          } else {
            // Si no tiene partidas cargar todos los productos
            this.cargarProdutos();
          }
        } else {
          this.cargarProdutos();
        }
      },
      error: (err) => {
        console.error('Error al verificar partidas:', err);
        // Si hay error, cargar todos los productos
        this.cargarProdutos();
      },
    });
  }

  transformarProductosParaDropdown(data: any) {
    const productosPlanos: any[] = [];

    if (data.partidas && Array.isArray(data.partidas)) {
      // Obtener IDs de productos
      const idsRestringidos = this.displayData.map((item) => item.id_producto);

      data.partidas.forEach((partida: any) => {
        if (partida.productos && Array.isArray(partida.productos)) {
          partida.productos.forEach((producto: any) => {
            // No incluir productos que ya están restringidos
            if (!idsRestringidos.includes(producto.id_producto)) {
              productosPlanos.push({
                id_producto: producto.id_producto,
                nombre: `${producto.nombre_producto} - ${
                  partida.nombre_partida
                } ($${producto.precio || 0})`,
                nombre_producto: producto.nombre_producto,
                precio: producto.precio || 0,
                partida: partida.nombre_partida,
                unidad_medida: producto.unidad_medida
                  ? producto.unidad_medida.nombre_unidad
                  : 'N/A',
              });
            }
          });
        }
      });
    }

    // Ordenar por nombre
    productosPlanos.sort((a, b) =>
      a.nombre_producto.localeCompare(b.nombre_producto)
    );
    this.productosFiltrados = productosPlanos;

    console.log(
      'Productos disponibles para dropdown:',
      this.productosFiltrados
    );
  }

  cargarProdutos() {
    this.admministrativeService.getProductos().subscribe({
      next: (items) => {
        this.productos = items.products;
        console.log('Todos los productos:', this.productos);
        if (this.displayData.length > 0) {
          const idsRestringidos = this.displayData.map(
            (item) => item.id_producto
          );
          this.productos = this.productos.filter(
            (p: { id_producto: any; }) => !idsRestringidos.includes(p.id_producto)
          );
        }
      },
      error: (err) => {
        this.alertService.error(err.error.msg);
        console.error(err);
      },
    });
  }

  cargarProductosDescartados(id: number) {
    this.admministrativeService.productosRestringidos(id).subscribe({
      next: (items) => {
        this.displayData = items.productos;
        console.log('Productos restringidos:', this.displayData);

        // Actualizar lista de IDs restringidos
        this.productosRestringidos = this.displayData.map(
          (item) => item.id_producto
        );

        // actualizar lista una vez obtenidos los productos
        if (this.productosArea.partidas) {
          this.transformarProductosParaDropdown(this.productosArea);
        }
        else if (this.productos) {
          this.productos = this.productos.filter(
            (p: { id_producto: any; }) => !this.productosRestringidos.includes(p.id_producto)
          );
        }
      },
      error: (err) => {
        this.alertService.error(err.msg);
        console.error(err);
      },
    });
  }

  descartaProducto() {
    console.log('Mandando info');
    console.log('id_area_fin: ', this.dataRow?.id_area_fin);
    console.log('id_producto: ', this.id_producto_seleccionada);
    console.log('ct_usuario_in: ', this.user.user.id_usuario);

    if (!this.id_producto_seleccionada) {
      this.alertService.warning('Debe seleccionar un producto');
      return;
    }

    this.admministrativeService
      .descartarProducto({
        id_area_fin: this.dataRow?.id_area_fin,
        id_producto: this.id_producto_seleccionada,
        ct_usuario_in: this.user.user.id_usuario,
      })
      .subscribe({
        next: (response) => {
          this.alertService.success(
            'Se ha restringido el producto correctamente',
            'Producto Descartado'
          );
          // Recargar datos
          if (this.dataRow?.id_area_fin) {
            this.cargarProductosDescartados(this.dataRow.id_area_fin);
            if (this.tienePartidas) {
              this.verificarPartidasArea(this.dataRow.id_area_fin);
            } else {
              this.cargarProdutos();
            }
          }
          this.id_producto_seleccionada = null;
        },
        error: (error) => {
          console.error('Error al descartar producto:', error);
          this.alertService.error(
            error.error.msg || 'Error al descartar producto'
          );
        },
        complete: () => {
          this.closeModal();
        },
      });
  }

  closeModal() {
    this.modalService.close();
  }

  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 4;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  columnDefs: ColDef[] = [
    {
      field: 'id_producto',
      headerName: 'ID',
      maxWidth: 100,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Nombre Producto',
      valueGetter: (params) => params.data.producto?.nombre_producto || '',
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Precio',
      valueGetter: (params) => params.data.producto?.precio || 0,
      valueFormatter: (params) =>
        params.value ? `$${params.value.toFixed(2)}` : '',
      flex: 1,
      filter: true,
      maxWidth: 200,
      sortable: true,
    },
    {
      headerName: 'Unidad',
      valueGetter: (params) =>
        params.data.producto?.unidad_medida?.nombre_unidad || 'No asignada',
      flex: 0.8,
      minWidth: 120,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Acciones',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onDelete: this.delete.bind(this),
      },
      flex: 1,
      maxWidth: 120,
      filter: false,
    },
  ];

  public gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    localeText: localeText,
    pagination: true,
    paginationPageSize: this.paginationPageSize,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
  };

  delete(event: any): void {
    console.log('BORRANDO RESTRICCIÓN DE PRODUCTO');

    // Obtener el nombre correcto del producto
    const nombreProducto =
      event.data.producto?.nombre_producto || 'desconocido';

    this.alertService
      .confirm(
        `¿Está seguro que desea habilitar el producto "${nombreProducto}" para esta área?`,
        'Habilitar producto'
      )
      .then((result) => {
        if (result.isConfirmed) {
          // implementar la llamada al servicio para eliminar la restricción, ejemplo xxd en lo que lo hago
          // this.admministrativeService
          //   .eliminarRestriccion(event.data.id_producto_area)
          //   .subscribe({
          //     next: () => {
          //       this.alertService.success(
          //         'Se ha habilitado correctamente',
          //         'Habilitar producto'
          //       );
          //       // Recargar datos
          //       if (this.dataRow?.id_area_fin) {
          //         this.cargarProductosDescartados(this.dataRow.id_area_fin);

          //         // Actualizar lista de productos disponibles
          //         if (this.tienePartidas) {
          //           this.verificarPartidasArea(this.dataRow.id_area_fin);
          //         } else {
          //           this.cargarProdutos();
          //         }
          //       }
          //     },
          //     error: (error: any) => {
          //       console.error('Error al eliminar restricción:', error);
          //       this.alertService.error(
          //         'Ha ocurrido un error al volver a habilitar el producto',
          //         'Error'
          //       );
          //     },
          //   });
        }
      });
  }
}
