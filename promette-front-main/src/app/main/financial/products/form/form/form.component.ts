import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  Product,
  Item,
  MeasurementUnit,
  CreateProductDto,
} from '../../interfaces/products.interface';
import { DropdownModule } from 'primeng/dropdown';
import { CoreLoadingService } from '../../../../../core/services/core.loading.service';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';

/**
 * Componente para el formulario de creación y edición de productos
 */
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent implements OnInit {
  /**
   * Acceso al formulario para validación
   */
  @ViewChild('productForm') productForm!: NgForm;

  /**
   * Datos del producto a editar o crear
   * Si es null, se inicializará un producto vacío
   */
  @Input() product: Product | CreateProductDto | null = null;

  /**
   * Lista de partidas disponibles para la selección
   */
  @Input() partidas: Item[] = [];

  /**
   * Lista de unidades de medida disponibles
   */
  @Input() unidades: MeasurementUnit[] = [];

  /**
   * Función callback para guardar cambios
   */
  @Input() onSave: (product: Product | CreateProductDto) => void = () => {};

  /**
   * Función callback para cerrar el formulario
   */
  @Input() close: () => void = () => {};

  /**
   * Mensaje de error si ocurre algún problema con el backend
   */
  errorMessage = '';

  /**
   * Filtros para los dropdowns
   */
  public partidaFiltrada: string = '';
  public unidadFiltrada: string = '';
  public isLoading: boolean | null | undefined;

  constructor(
    public loadingService: CoreLoadingService, // Changed from private to public
    private alertService: CoreAlertService
  ) {}

  /**
   * Inicializa el componente y prepara el producto para edición
   */
  ngOnInit(): void {
    // Si no hay producto proporcionado, crear uno nuevo
    if (!this.product) {
      this.product = this.createEmptyProduct();
    }

    // Asegurarse de que los campos de selección tengan valores válidos para el bind
    if ('id_producto' in this.product) {
      // Es un producto existente (edición)
      // Todo bien, ya tiene valores reales
    } else {
      // Es un nuevo producto (creación)
      this.product.ct_partida_id = 0;
      this.product.ct_unidad_id = 0;
    }
  }

  /**
   * Crea un producto vacío con valores predeterminados
   * @returns Un objeto Product inicializado
   */
  createEmptyProduct(): CreateProductDto {
    return {
      nombre_producto: '',
      precio: 0,
      ct_unidad_id: 0,
      estado: 1,
      ct_usuario_in: 1,
      ct_partida_id: 0,
    };
  }

  /**
   * Obtiene la partida seleccionada para mostrar en el dropdown
   * @returns Partida seleccionada o undefined
   */
  getSelectedPartida(): Item | undefined {
    if (!this.product || !this.partidas || this.partidas.length === 0) {
      return undefined;
    }
    return this.partidas.find(
      (partida) => partida.id_partida === this.product!.ct_partida_id
    );
  }

  /**
   * Obtiene la unidad seleccionada para mostrar en el dropdown
   * @returns Unidad seleccionada o undefined
   */
  getSelectedUnidad(): MeasurementUnit | undefined {
    if (!this.product || !this.unidades || this.unidades.length === 0) {
      return undefined;
    }
    return this.unidades.find(
      (unidad) => unidad.id_unidad === this.product!.ct_unidad_id
    );
  }

  /**
   * Obtiene el texto de visualización para una unidad
   * @param unidad La unidad a mostrar
   * @returns Texto formateado con clave y nombre
   */
  getUnidadDisplayText(unidad?: MeasurementUnit | null): string {
    if (!unidad) return '';

    if (unidad.clave_unidad && unidad.clave_unidad.trim() !== '') {
      if (unidad.nombre_unidad && unidad.nombre_unidad.trim() !== '') {
        return `${unidad.clave_unidad} - ${unidad.nombre_unidad}`;
      }
      return unidad.clave_unidad;
    }

    if (unidad.nombre_unidad && unidad.nombre_unidad.trim() !== '') {
      return unidad.nombre_unidad;
    }

    return 'Sin información';
  }

  /**
   * Obtiene la representación textual de una partida
   * @param partida La partida a representar
   * @returns String formateado con clave y nombre
   */
  getPartidaLabel(partida: Item): string {
    if (!partida) return '';
    return `${partida.clave_partida} - ${partida.nombre_partida}`;
  }

  /**
   * Obtiene la representación textual de una unidad de medida
   * @param unidad La unidad a representar
   * @returns String formateado con clave y nombre
   */
  getUnidadLabel(unidad: MeasurementUnit): string {
    if (!unidad) return '';
    return this.getUnidadDisplayText(unidad);
  }

  /**
   * Maneja el guardado del formulario
   */
  handleSave(): void {
    if (!this.product || this.productForm.invalid) {
      if (this.productForm.invalid) {
        this.alertService.warning(
          'Por favor complete todos los campos requeridos correctamente'
        );
      }
      return;
    }

    this.loadingService.show();
    this.errorMessage = '';

    try {
      this.onSave(this.product);
      // No cerramos aquí porque se hará después de la respuesta exitosa
    } catch (error) {
      this.errorMessage = 'Se produjo un error al procesar la solicitud';
      console.error('Error en handleSave:', error);
      this.alertService.error(this.errorMessage);
      this.loadingService.hide();
    }
  }

  /**
   * Maneja el cambio en el estado del producto
   * @param event Evento del input
   */
  onEstadoChange(event: any): void {
    // Asegurar que estado siempre sea 1 o 0, no true/false
    this.product!.estado = event.target.checked ? 1 : 0;
  }
}
