import { Component } from '@angular/core';

@Component({
  selector: 'btn-eliminar-renderer',
  template: `<div class="d-flex justify-content-center">
            <button class="btn btn-sm btn-outline-danger delete-btn" (click)="onClick()"
                    title="delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>`
})
export class BtnEliminarRendererComponent {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  onClick(): void {
    this.params.onDelete(this.params);
  }
}