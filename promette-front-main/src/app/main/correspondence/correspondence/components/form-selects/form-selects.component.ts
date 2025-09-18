import { CommonModule } from '@angular/common';
import { CorrespondenceService } from '../../services/correspondence.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'form-selects-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule], // Removido DropdownModule
  templateUrl: './form-selects.component.html',
  styleUrl: './form-selects.component.scss',
})
export class FormSelectsComponent implements OnInit {
  // Selects y variables para el filtro
  formasEntrega: any[] = []; // Opciones para "Medio"
  estadosCorrespondencia: any[] = []; // Opciones para "Estado"
  prioridades: any[] = []; // Opciones para "Tipo"
  selectedFormaEntrega: string = '';
  selectedEstado: string | null = null; // Permitir null para que el dropdown no seleccione ningún estado por defecto
  selectedPrioridad: string = '';
  fechaRecepcion: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Fecha máxima para el input

  @Output() filtrosSeleccionados = new EventEmitter<any>();

  constructor(private correspondenceService: CorrespondenceService) {}

  ngOnInit() {
    // Cargar formas de entrega desde la base de datos
    this.correspondenceService.getFormaEntrega().subscribe((resp: any) => {
      this.formasEntrega = resp.data || resp;
    });
    // Cargar estados de correspondencia desde la base de datos en el módulo principal de correspondencia en el inicio
    this.correspondenceService
      .getEstadosCorrespondencia()
      .subscribe((resp: any) => {
        this.estadosCorrespondencia = resp.data || resp;
      });
    // Cargar prioridades desde la base de datos
    this.correspondenceService
      .getClasificacionPrioridad()
      .subscribe((resp: any) => {
        this.prioridades = resp.data || resp;
      });
  }

  // Método para buscar los filtros seleccionados
  buscar() {
    // Construye los parámetros de búsqueda con los nombres que espera el backend
    const params: any = {};
    if (this.selectedFormaEntrega)
      params.ct_forma_entrega_id = this.selectedFormaEntrega;
    // Solo agregar estado si está seleccionado y no es vacío ni "Todos"
    if (
      this.selectedEstado &&
      this.selectedEstado !== '' &&
      this.selectedEstado !== 'Todos'
    )
      params.estado = this.selectedEstado;
    if (this.selectedPrioridad)
      params.ct_clasificacion_prioridad_id = this.selectedPrioridad;
    if (this.fechaRecepcion) params.fecha = this.fechaRecepcion;
    // Si se filtra, hacerlo en el componente padre usando los datos ya cargados
    this.filtrosSeleccionados.emit(params); // Emite los filtros al padre
  }
}
// Comentarios:
// - Se agregan propiedades y métodos para enlazar los selects y el input de fecha.
// - Se cargan los datos de la base usando CorrespondenceService.
// - Se importa FormsModule para habilitar ngModel en el HTML.
