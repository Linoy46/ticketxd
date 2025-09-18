export interface UploadResult {
  path: string; // Ruta relativa del archivo (para guardar en BD)
  replaced: boolean; // Indica si se reemplazó un archivo existente
  originalName: string; // Nombre original del archivo subido
}

export interface DocumentReference {
  id?: string; // ID del documento en BD si es aplicable
  path: string; // Ruta relativa al archivo
  originalName?: string; // Nombre original
  uploadDate?: Date; // Fecha de subida
  mimeType?: string; // Tipo MIME
}
