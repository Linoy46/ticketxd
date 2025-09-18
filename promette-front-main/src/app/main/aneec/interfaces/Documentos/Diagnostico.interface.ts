export interface DiagnosisResponse {
    success:      boolean;
    message:     string;
    diagnosticos?: Diagnostico[];
    error?:       any;
}


export interface Diagnostico {
    id_diagnostico: number;
    curp: string;
    nombreCompleto: string;
    ct_municipio_id: number;
    tipo_necesidad: string;
    rehabilitacion_fisica: string;
    ruta_diagnostico: string;
    dt_aspirante_id: number;
    ct_usuario_in: number;
    ct_usuario_at: null;
    ruta_INE_tutor: string;
    ruta_acta_nacimiento_usuario: string;
    ruta_comprobante_domicilio: string;
    ruta_privacidad_usuario: string;
    ruta_carta_compromiso_usuario: string;
    createdAt: Date;
    updatedAt: Date;
    dt_aspirante: DtAspirante;
}

export interface DtAspirante {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}

