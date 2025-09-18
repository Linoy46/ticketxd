import { Observable, throwError } from 'rxjs';
import { CoreAlertService } from '../services/core.alert.service';

export function handleError(
  error: any,
  alertService: CoreAlertService,
  customMessage: string
): Observable<never> {
  // console.error(customMessage, error);

  // Si el error tiene una estructura más compleja (con detalles específicos)
  if (error?.error?.errors?.length > 0) {
    const errorDetails = error.error.errors[0];
    const fieldName = errorDetails.path; // Nombre del campo que causó el error
    const errorMessage = errorDetails.msg; // Mensaje de error
    alertService.error(`${errorMessage}`);
  }
  // Si el error contiene un mensaje más simple, como "Usuario o contraseña incorrectos"
  else if (error?.error?.msg) {
    alertService.error(error.error.msg);
  } else {
    alertService.error(customMessage);
  }

  return throwError(error);
}
