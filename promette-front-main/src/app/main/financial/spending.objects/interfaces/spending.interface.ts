export interface Capitulo {
  id?: number;
  id_capitulo?: number;
  clave_capitulo: number;
  nombre_capitulo: string;
  estado?: number;
  nombre?: string; // Para compatibilidad con el código existente
}

export interface Concepto {
  id?: number;
  id_partida?: number;
  capituloId?: number;
  ct_capitulo_id?: number;
  clave_partida: string;
  nombre_partida: string;
  estado?: number;
  ct_capitulo?: Capitulo;
}

export interface Generica {
  id: number;
  nombre: string;
  conceptoId: number;
}

export interface Especifica {
  id: number;
  capitulo: string;
  concepto: string;
  clave: string;
  especifica: string;
}

export interface ChapterResponse {
  chapters: Capitulo[];
  msg?: string;
}

export interface ChapterDetailResponse {
  chapter: Capitulo;
  msg?: string;
}

export interface ItemResponse {
  items: Concepto[];
  msg?: string;
}

export interface ItemDetailResponse {
  item: Concepto;
  msg?: string;
}
