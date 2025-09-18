import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'puestoFilter', standalone: true })
export class PuestoFilterPipe implements PipeTransform {
  transform(areas: { nombre: string }[], filtro: string): { nombre: string }[] {
    if (!filtro) return areas;
    return areas.filter(area => area.nombre.toLowerCase().includes(filtro.toLowerCase()));
  }
} 