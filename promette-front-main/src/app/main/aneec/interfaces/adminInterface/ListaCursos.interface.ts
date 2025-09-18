export interface CoursesResponse {
    success:             boolean;
    cursosWithModalidad: CursosWithModalidad[];
}

export interface CursosWithModalidad {
    id:                     number;
    claveCurso:             string;
    nombreCurso:            string;
    vertienteParticipacion: string;
    ct_modalidad_curso_id:  string;
    duracion:               string;
    nivelEducativo:         string;
    funcion:                string;
    rutaInfografia:         null | File;
    periodo:                string;
    vigencia:               string;
    fecha_in:               Date;
    ct_usuarios_in:         number;
    fecha_at:               Date | null;
    ct_usuarios_at:         null;
    cupoTotal:              number | null;
    inscritos:              number | null;
}

export interface FormDataCourse {
    success: boolean;
    message: string;
    data?:    Data;
    error: any;
}

export interface Data {
    nombreCurso:            string;
    vertienteParticipacion: string;
    ct_modalidad_curso_id:  string;
    duracion:               string;
    rutaInfografia:         File | null;
    periodo:                string;
    vigencia:               string;
    nivelEducativo:         string;
    funcion:                string;
    ct_usuarios_in:         number;
    claveCurso:             string;
    cupoTotal:              number | null;
}

export interface Fecha {
    fn:   string;
    args: any[];
}


export interface NuevoCursoResponse{
    claveCurso: string;
    nombreCurso: string;
    vertienteParticipacion: string;
    ct_modalidad_curso_id: string;
    duracion: string;
    nivelEducativo: string;
    funcion: string;
    periodo: string;    
    vigencia: string;
    rutaInfografia: File | null;
    ct_usuarios_in: number;
    cupoTotal: number;
}