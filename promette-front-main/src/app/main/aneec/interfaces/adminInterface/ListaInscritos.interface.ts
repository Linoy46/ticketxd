export interface ApplicantsResponse {
    success:    boolean;
    applicants: Applicant[];
}

export interface Applicant {
    id:                number;
    folio:             string;
    curp:              string;
    nombre:            string;
    aPaterno:          string;
    aMaterno:          string;
    correoElectronico: string;
    numTelefono:       string;
    gradoEstudios:     string;
    municipio:         string;
    funcion:           string;
    cct:               string;
    nivelEducativo:    string;
    anioServicio:      string;
    nombreCurso:       string;
    fecha_in:          Date;
    ct_usuarios_in:    number;
    fecha_at:          Date | null;
    ct_usuarios_at:    null;
}
