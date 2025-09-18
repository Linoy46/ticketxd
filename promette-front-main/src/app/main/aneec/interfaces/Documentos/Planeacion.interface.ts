export interface DocumentoPlaneacion {
    success:      boolean;
    message:      string;
    planeaciones?: RespuestaPlaneaciones[];
    error?: any;
}

export interface RespuestaPlaneaciones{
    facilitador:  Facilitador;
    planeaciones: Planeaciones[];
}

export interface Facilitador {
    id_aspirante:     number;
    nombre:           string;
    apellido_paterno: string;
    apellido_materno: string;
    curp:             string;
}

export interface Planeaciones {
    id_planeacion:       number;
    ruta_documento:      string;
    id_tipo_documento:   number;
    nombre_documento:    string;
    dt_diagnostico_id:   number;
    ct_usuario_in:       number;
    ct_usuario_at:       null;
    createdAt:           Date;
    updatedAt:           Date;
    dt_diagnostico:      DtDiagnostico;
    ct_documentos_aneec: CTDocumentosAneec;
}

export interface CTDocumentosAneec {
    id_tipo_documento: number;
    nombre:            string;
}

export interface DtDiagnostico {
    nombreCompleto:        string;
    curp:                  string;
    tipo_necesidad:        string;
    rehabilitacion_fisica: string;
}
