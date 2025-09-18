import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'shared-actions-grid-component',
  imports: [CommonModule],
  templateUrl: './shared-actions-grid.component.html',
  standalone: true,
})
export class SharedActionsGridComponent {
  // Add Input decorator to make it bindable in templates
  @Input() params: any;

  // This is used by ag-Grid
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  // Método llamado cuando el usuario hace clic en el botón "Ver"
  onViewClick(): void {
    if (this.params?.onView) {
      this.params?.onView(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Editar"
  onEditClick(): void {
    if (this.params.onEdit) {
      this.params.onEdit(this.params.data?.originalData || this.params.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Eliminar"
  onDeleteClick(): void {
    if (this.params.onDelete) {
      this.params.onDelete(this.params.data?.originalData || this.params.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Agregar"
  onAddClick(): void {
    if (this.params?.onAdd) {
      this.params?.onAdd(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Excel"
  onExcel(): void {
    if (this.params?.onExcel) {
      this.params?.onExcel(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "PDF"
  onPDF(): void {
    if (this.params?.onPDF) {
      this.params?.onPDF(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Partida"
  onPartida(): void {
    if (this.params?.onPartida) {
      this.params?.onPartida(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Producto"
  onProducto(): void {
    if (this.params?.onProducto) {
      this.params?.onProducto(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Agregar Canvas"
  onCreateCanvaClick(): void {
    if (this.params?.onCreateCanva) {
      this.params?.onCreateCanva(this.params?.data);
    }
  }

  // Nuevo método para asignar encargado
  onAssignManagerClick(): void {
    if (this.params?.onAssignManager) {
      this.params?.onAssignManager(this.params?.data);
    }
  }

  // Nuevo método para asignar analista
  onAssignAnalystClick(): void {
    if (this.params?.onAssignAnalyst) {
      this.params?.onAssignAnalyst(this.params?.data);
    }
  }

  // Método llamado cuando el usuario hace clic en el botón "Editar completo (lápiz) en el módulo de correspondencia"
  onEditFullClick(): void {
    if (this.params.onEditFull) {
      this.params.onEditFull(
        this.params.data?.originalData || this.params.data
      );
    }
  }

  // Nuevo método para descargar reporte en Excel
  onReport(): void {
    if (this.params && this.params.onReporte) {
      const rowData = this.params.data;
      if (rowData) {
        this.params.onReporte(rowData);
      } else {
        console.error('No se pudo obtener los datos de la fila');
      }
    }
  }

  // Método requerido por ag-Grid para actualizar el componente
  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  // Método llamado cuando el usuario hace clic en el botón "PDF"
  onHabilitar(): void {
    if (this.params?.onHabilitar) {
      this.params?.onHabilitar(this.params?.data);
    }
  }

}
