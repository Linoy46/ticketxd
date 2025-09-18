import { HttpInterceptorFn } from '@angular/common/http'; // Importa la interfaz necesaria para el interceptor HTTP
import { inject } from '@angular/core'; // Función para inyectar dependencias en el interceptor
import { catchError, switchMap } from 'rxjs/operators'; // Operadores de RxJS para manejar errores y hacer transformaciones en los flujos de datos
import { throwError } from 'rxjs'; // Para lanzar errores de forma controlada
import { AuthLoginService } from '../../main/auth/services/auth.login.service';// Importa el servicio de autenticación

// Definición del interceptor de autenticación
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  // Inyecta el servicio de autenticación en el interceptor
  const authService = inject(AuthLoginService);

  // Obtiene el token de autenticación actual
  const authToken = authService.getToken();

  // Clona la solicitud original para agregar los encabezados necesarios
  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`, // Agrega el token de autenticación en los encabezados
      },
    });
  }

  // Pasa la solicitud clonada al siguiente interceptor o al servicio HTTP
  return next(authReq).pipe(
    // Si ocurre un error, lo manejamos aquí
    catchError((error) => {
      // Si el error es un error 401 (No autorizado), significa que el token ha expirado
      if (error.status === 401) {
        // Llama al método para manejar el token expirado
        return authService.handleExpiredToken().pipe(
          // Después de renovar el token, realiza una nueva solicitud con el token actualizado
          switchMap(() => {
            const newAuthToken = authService.getToken(); // Obtiene el nuevo token
            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuthToken}`, // Agrega el nuevo token a los encabezados
              },
            });
            // Realiza la solicitud nuevamente con el nuevo token
            return next(newAuthReq);
          })
        );
      }
      // Si el error no es 401, simplemente lanza el error original
      return throwError(() => error);
    })
  );
};
