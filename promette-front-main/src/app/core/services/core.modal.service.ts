import { Injectable, Type } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoreModalService {
  showLoading(arg0: string) {
    throw new Error('Method not implemented.');
  }
  getData(): {
    onSave: Function | undefined;
    chapters: never[];
    type: string;
    item: {};
    data: any;
  } {
    throw new Error('Method not implemented.');
  }
  private modalState = new Subject<any>();
  modalState$ = this.modalState.asObservable();

  // Agregar un método para obtener el estado actual del modal
  private currentModalState: any = null;

  /**
   * Abre un modal con los datos proporcionados
   * @param component El componente a mostrar en el modal
   * @param title Título del modal
   * @param data Datos a pasar al componente
   * @param imageUrl URL de imagen (opcional)
   * @param pdfUrl URL de PDF (opcional)
   */
  open<T>(
    component: Type<T> | any,
    title: string,
    data?: any,
    imageUrl?: string,
    pdfUrl?: string
  ): void {
    // console.log(
    //   `CoreModalService: Abriendo modal con componente:`,
    //   component?.name || component
    // );
    // console.log(`CoreModalService: Título del modal: "${title}"`);
    // console.log(`CoreModalService: Datos del modal:`, data);

    // Emitir el evento para abrir el modal con los datos proporcionados
    this.currentModalState = {
      component,
      title,
      data,
      imageUrl,
      pdfUrl,
    };
    this.modalState.next(this.currentModalState);
  }

  /**
   * Cierra el modal actual
   */
  close(): void {
    // console.log('CoreModalService: Cerrando modal');
    this.modalState.next(false);
  }

  // Método para obtener el estado actual del modal
  getCurrentModalState(): any {
    return this.currentModalState;
  }
}
