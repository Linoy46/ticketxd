import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OutsUtilsService {
  constructor() {}

  /**
   * Formatea una fecha para mostrar en formato local
   * @param dateString Fecha en formato ISO string
   * @returns Fecha formateada (DD/MM/YYYY)
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString || 'Fecha no disponible';
    }
  }

  /**
   * Genera un folio único para entregas
   * @returns Folio con formato OUT-YYYYMMDD-XXX
   */
  generateOutFolio(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `OUT-${year}${month}${day}-${random}`;
  }

  /**
   * Genera un folio único para formatos de entrega
   * @returns Folio con formato FORMAT-YYYYMM-XXX
   */
  generateFormatoFolio(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `FORMAT-${year}${month}-${random}`;
  }

  /**
   * Valida las cantidades a entregar contra las existencias
   * @param cantidadEntregar Cantidad que se desea entregar
   * @param cantidadDisponible Cantidad disponible en inventario
   * @returns Objeto con resultado de validación
   */
  validarCantidad(
    cantidadEntregar: number,
    cantidadDisponible: number
  ): {
    valido: boolean;
    mensaje?: string;
  } {
    if (cantidadEntregar <= 0) {
      return {
        valido: false,
        mensaje: 'La cantidad debe ser mayor a cero',
      };
    }

    if (cantidadEntregar > cantidadDisponible) {
      return {
        valido: false,
        mensaje: `La cantidad excede el disponible (${cantidadDisponible})`,
      };
    }

    return { valido: true };
  }

  /**
   * Formatea una fecha para mostrar el mes y año en español
   * @param date Fecha a formatear
   * @returns Mes y año formateados (ej: "Enero 2023")
   */
  formatMesAno(date: Date = new Date()): string {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();

    return `${mes} ${ano}`;
  }

  /**
   * Prepara datos de formato para su creación
   */
  prepareFormatoData(
    formData: any,
    usuarioId: number,
    entregaIds: number[]
  ): any {
    return {
      mes_cantidad: formData.mes_cantidad || this.formatMesAno(),
      persona_recibe: formData.persona_recibe || '',
      ct_usuario_id: usuarioId,
      entregas_ids: entregaIds,
    };
  }
}
