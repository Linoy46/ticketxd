/**
 * @file form.component.ts
 * @description Componente de formulario para crear y editar fuentes de financiamiento
 *
 * Para integración backend:
 * - Agregar validaciones más robustas (ReactiveFormsModule)
 * - Considerar agregar carga asíncrona de catálogos (tipos, estados)
 * - Implementar manejo de archivos adjuntos si es necesario
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundingSource } from '../../interfaces/budgets.interface';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  /**
   * Datos de la fuente de financiamiento a editar
   * @property {FundingSource | null} source
   */
  @Input() source: FundingSource | null = null;

  /**
   * Función callback para guardar cambios
   * @property {Function} onSave
   */
  @Input() onSave: ((source: FundingSource) => void) = () => {};

  /**
   * Función callback para cerrar el formulario
   * @property {Function} close
   */
  @Input() close: (() => void) = () => {};

  /**
   * Opciones para el tipo de fuente
   * @property {string[]} typeOptions
   * @todo Para integración backend: Cargar dinámicamente desde API de catálogos
   */
  typeOptions: string[] = [
    'Federal',
    'Estatal',
    'Municipal',
    'Internacional',
    'Privado'
  ];

  /**
   * Opciones para el estado de la fuente
   * @property {Array<{value: string, label: string}>} statusOptions
   * @todo Para integración backend: Cargar dinámicamente desde API de catálogos
   */
  statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' }
  ];

  ngOnInit(): void {
    // Si no hay fuente proporcionada, crear una nueva
    if (!this.source) {
      this.source = {
        id: 0,
        description: '',
        type: '',
        amount: 0,
        status: 'active'
      };
    }

    /**
     * @todo Para integración backend:
     * - Cargar catálogos necesarios (tipos, estados)
     * - Validar permisos del usuario para editar/crear
     * - Si es edición, verificar que el registro existe
     */
  }

  /**
   * Maneja el guardado del formulario
   * @method handleSave
   *
   * @todo Para integración backend:
   * - Implementar validaciones más robustas
   * - Considerar sanitización de datos
   * - Validar montos según reglas de negocio
   */
  handleSave(): void {
    if (this.source) {
      // Validación básica
      if (!this.source.description || !this.source.type) {
        // Mostrar error - para futura implementación
        return;
      }

      this.onSave(this.source);
      this.close();
    }
  }
}
