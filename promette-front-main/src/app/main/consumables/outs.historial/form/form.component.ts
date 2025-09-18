import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-outs-historial-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @Input() message: string = '¿Está seguro que desea realizar esta acción?';
  @Input() title: string = 'Confirmación';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() content: string = ''; // Contenido HTML para detalles
  @Input() isSuccess: boolean = false;
  @Input() isError: boolean = false;
  @Input() folio: string = '';
  @Input() onVerPdf: () => void = () => {};
  @Input() onNavigateToHistory: () => void = () => {};

  // Will be injected by the modal service
  close: () => void = () => {};

  constructor(private router: Router) {}

  /**
   * Cierra el modal actual
   */
  closeModal(): void {
    this.close();
  }

  /**
   * Genera el PDF asociado con este registro
   */
  generatePdf(): void {
    if (this.onVerPdf) {
      this.onVerPdf();
    }
  }

  /**
   * Navega al historial de salidas
   */
  navigateToHistory(): void {
    if (this.onNavigateToHistory) {
      this.onNavigateToHistory();
    } else {
      this.close(); // Cerrar el modal primero
      this.router.navigate(['inventory-history']);
    }
  }
}
