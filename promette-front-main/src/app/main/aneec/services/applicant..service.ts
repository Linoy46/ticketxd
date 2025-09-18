import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {NewAplicant } from '../interfaces/applicantInterface/PersonaInscrita.Interface';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { Reports }from '../interfaces/applicantInterface/PersonaInscrita.Interface'
//import { BackendError } from '../../../core/interfaces/backend-error.interface';
import { DiagnosisResponse } from '../interfaces/Documentos/Diagnostico.interface';
import { DocumentoPlaneacion } from '../interfaces/Documentos/Planeacion.interface';


interface BackendError {
    type: string;
    msg: string;
    path: string;
    location: string;
    value?: any;
}

@Injectable({
  providedIn: 'root'
})


export class ApplicantService {

    private apiUrlPromette = environment.apiUrlPromette;

    constructor(private http: HttpClient, private CoreAlertService: CoreAlertService) { }



    //Obtener los datos de los aspirantes con sus diagnósticos
    getAplicants(): Observable<NewAplicant> {
        return this.http.get<NewAplicant>(`${this.apiUrlPromette}/annecApplicant/getApplicantsWithDiagnosticsAneec`).pipe(
            catchError(error => {
                const message = error.error?.msg || 'Error al obtener los datos';
                //this.CoreAlertService.error(message);
                console.log(message)
                return of({ success: false, message, error });
            })
        );
    }

    //metodo para cambiar el estatus del facilitador
    changeStatus(id_aspirante: number, status: string, id_usuario:number): Observable<any> {
        console.log(`ID DEL USUARIO ACTIVO ${id_usuario}`)
        return this.http.put<any>(`${this.apiUrlPromette}/annecApplicant/changeApplicantStateWithEmail`, { id_aspirante, status, id_usuario }).pipe(
            catchError(error => {
                const message = error.error?.msg || 'Error al cambiar el estatus';
                this.CoreAlertService.error(message);
                return of({ success: false, message, error });
            })
        );
    }


    //Consultar los datos de un facilitador por su idUsuario 
    getAplicantById(idUsuario: number): Observable<NewAplicant> {
        return this.http.get<NewAplicant>(`${this.apiUrlPromette}/annecApplicant/getApplicantByUserId/${idUsuario}`).pipe(
            catchError(error => {

                return of({ success: false, message: 'Error al obtener los datos', error });
            })
        );
    }

    //Consultar la lista de reportes de un facilitador
 /*   obtenerReportesFacilitador(dt_aspirante_id: number): Observable<Informes> {
        console.log(`Obteniendo datos del aspirante ${dt_aspirante_id}`);
        return this.http.get<Informes>(`${this.apiUrlPromette}/annecEvaluator/informes/${dt_aspirante_id}`).pipe(
            catchError(error => {
                return of({ success: false, message: 'Error al obtener los datos', error });
            })
        );  
    }
*/
    //Guardar el reporte del facilitador
    /*guardarReporte(formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.apiUrlPromette}/annecEvaluator/saveInforme`, formData).pipe(
            catchError(error => {
                // Extraer todos los mensajes de error de validación
                const validationErrors = (error?.error?.errors as BackendError[])?.map(err => err.msg) || [];
                // Si hay errores de validación, concatenarlos en un solo mensaje
                const validationErrorMessage = validationErrors.length > 0 ? `Errores de validación: ${validationErrors.join(', ')}` : null;
                // Si no hay errores de validación, buscar el mensaje en error.error.message
                const errorMessage = validationErrorMessage || error?.error?.message || 'Error al guardar el reporte';
                // Mostrar la alerta con el mensaje específico
                this.CoreAlertService.error(errorMessage);
                return of({ success: false, message: errorMessage, error });
            })//end catchError
        );
    }*/

    //Obtener todos los reportes disponibles
    getAllReports(): Observable<Reports>{
        return this.http.get<Reports>(`${this.apiUrlPromette}/annecApplicant/getAllReports`).pipe(
            catchError(error => {
                // Extraer todos los mensajes de error de validación
                const validationErrors = (error?.error?.errors as BackendError[])?.map(err => err.msg) || [];
                // Si hay errores de validación, concatenarlos en un solo mensaje
                const validationErrorMessage = validationErrors.length > 0 ? `Errores de validación: ${validationErrors.join(', ')}` : null;
                // Si no hay errores de validación, buscar el mensaje en error.error.message
                const errorMessage = validationErrorMessage || error?.error?.message || 'Error al buscar el reporte';
                // Mostrar la alerta con el mensaje específico
                //this.CoreAlertService.error(errorMessage);
                console.log(errorMessage)
                return of({ success: false, message: errorMessage, error });
            })//end catchError
        )//end pipa
    }//end method

    getAllPlans(): Observable<DocumentoPlaneacion> {
        return this.http.get<DocumentoPlaneacion>(`${this.apiUrlPromette}/annecApplicant/getAllPlannings`).pipe(
            catchError(error => {
                // Extraer todos los mensajes de error de validación
                const validationErrors = (error?.error?.errors as BackendError[])?.map(err => err.msg) || [];
                // Si hay errores de validación, concatenarlos en un solo mensaje
                const validationErrorMessage = validationErrors.length > 0 ? `Errores de validación: ${validationErrors.join(', ')}` : null;
                // Si no hay errores de validación, buscar el mensaje en error.error.message
                const errorMessage = validationErrorMessage || error?.error?.message || 'Error al buscar el reporte';
                // Mostrar la alerta con el mensaje específico
                //this.CoreAlertService.error(errorMessage);
                console.log(errorMessage)
                return of({ success: false, message: errorMessage, error });
            })
        )
    }


    //Obtener los datos de los pacientes
    getDiagnosticos(): Observable<DiagnosisResponse> {
        return this.http.get<DiagnosisResponse>(`${this.apiUrlPromette}/annecApplicant/getAllADiagnostics`).pipe(
            catchError(error => {
                const message = error.error?.msg || 'Error al obtener los datos';
                //this.CoreAlertService.error(message);
                console.log(message)
                return of({ success: false, message, error });
            })
        );
    }
 

}//end services
