export interface PersonaInscritaResponse {
  success: boolean;
  message: string;
  data?: FormDataApplicant;
  error?: any;
}
export interface PayrollDataResponse {
  success: boolean;
  message: string;
  applicant?: FormDataApplicant;
  error?: any;
}

export interface ApplicantData {
  curp: string;
  nombre: string;
  paterno: string;
  materno: string;
  cct: string;
}

export interface FormDataApplicant {
  curp: string;
  nombre: string;
  paterno: string;
  materno: string;
  correoElectronico: string;
  numTelefono: string;
  municipio: string;
  localidad: string;
  figura: string;
  idCurso: number;
  codigoPostal: string;
  universidad: string;
  licenciatura: string;
  direccion: string;
  fechaNac: Date;
  ct_cursos_funhi_id?: string;
  ct_usuarios_in?: string;
  ct_usuarios_at?: string;
}

export interface FormDataApplicantPatient {
  curp: string;
  nombreCompleto: string;
  tipo_necesidad: string;
  rehabilitacion_fisica: string;
  municipio: string;
  dt_aspirante_id: string;
  diagnostico: File | null;
}

export interface Aplicant {
  success: boolean;
  message: string;
  data?: Data;
  error: any;
}
export interface Data {
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  fecha_nacimiento: Date;
  instituto: string;
  licenciatura: string;
  direccion: string;
  codigo_postal: string;
  ct_municipio_id: string;
  localidad: string;
  ruta_ine: string;
  ruta_comprobante_estudio: string;
  ruta_comprobante_domicilio: string;
  ruta_carta_compromiso: string;
  ruta_carta_compromiso_tutor: string;
  ruta_aviso_privacidad_aspirante: string;
  ruta_privacidad_usuario: string;
  ct_usuario_in: Number;
}

export interface NewAplicant {
  success:    boolean;
  applicants?: Applicant[];
}

export interface Applicant {
  id_aspirante:                    number;
  curp:                            string;
  nombre:                          string;
  apellido_paterno:                string;
  apellido_materno:                string;
  correo:                          string;
  fecha_nacimiento:                Date;
  instituto:                       string;
  licenciatura:                    string;
  direccion:                       string;
  codigo_postal:                   string;
  ct_municipio_id:                 number;
  localidad:                       string;
  ruta_ine:                        string;
  ruta_comprobante_estudio:        string;
  ruta_comprobante_domicilio:      string;
  ruta_carta_compromiso:           string;
  ruta_carta_compromiso_tutor:     string;
  ruta_aviso_privacidad_aspirante: string;
  ruta_privacidad_usuario:         string;
  ct_usuario_in:                   number;
  ct_usuario_at:                   null;
  status:                          string;
  tipo_documento:                  string;
  telefono:                        string;
  createdAt:                       Date;
  updatedAt:                       Date;
  dt_diagnostico_aneecs:           DtDiagnosticoAneec[];
}

export interface DtDiagnosticoAneec {
  id_diagnostico:        number;
  curp:                  string;
  nombreCompleto:        string;
  ct_municipio_id:       number;
  tipo_necesidad:        string;
  rehabilitacion_fisica: RehabilitacionFisica;
  ruta_diagnostico:      string;
  dt_aspirante_id:       number;
  ct_usuario_in:         number;
  ct_usuario_at:         null;
  createdAt:             Date;
  updatedAt:             Date;
}

export enum RehabilitacionFisica {
  N = "N",
  S = "S",
}


//Estructura para informes de aneec
/*
export interface Informes {
  success:  boolean;
  message:  string;
  informes?: Informe[];
  error?:   any;
}

export interface Informe {
  id_informe:      number;
  ruta_informe:    string;
  dt_aspirante_id: number;
  ct_usuario_in:   number;
  ct_usuario_at:   null;
  createdAt:       Date;
  updatedAt:       Date;
}
*/

export interface Reports {
  success:  boolean;
  message:  string;
  informes?: ReportsInforme[];
  error: any;
}

export interface ReportsInforme {
  facilitador: Facilitador;
  informes:    InformeInforme[];
}

export interface Facilitador {
  id_aspirante:     number;
  nombre:           string;
  apellido_paterno: string;
  apellido_materno: string;
  curp:             string;
}

export interface InformeInforme {
  id_informe:        number;
  ruta_informe:      string;
  dt_diagnostico_id: number;
  ct_usuario_in:     number;
  ct_usuario_at:     null;
  createdAt:         Date;
  updatedAt:         Date;
  dt_diagnostico:    DtDiagnostico;
}

export interface DtDiagnostico {
  nombreCompleto:        string;
  curp:                  string;
  tipo_necesidad:        string;
  rehabilitacion_fisica: string;
}
