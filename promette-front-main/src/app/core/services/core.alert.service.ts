import { Injectable } from '@angular/core'; // Importa el decorador Injectable para que el servicio sea inyectable
import Swal from 'sweetalert2'; // Importa SweetAlert2 para crear alertas personalizadas

@Injectable({
  providedIn: 'root', // Define que este servicio se provee a nivel de la raíz (disponible Coremente)
})
export class CoreAlertService {
 
  constructor() {}

  // Muestra un mensaje de bienvenida
  showWelcomeMessage(message: string = '¡Bienvenido a la aplicación!') {
    Swal.fire({
      title: '¡Hola!',
      text: message, // El mensaje se pasa como argumento o usa un valor por defecto
      icon: 'success', // Tipo de icono (exitoso)
      confirmButtonText: 'Aceptar', // Texto del botón de confirmación
    });
  }

  // Alerta de éxito
  success(message: string, title: string = '¡Éxito!') {
    Swal.fire({
      title: title, // Título de la alerta (por defecto '¡Éxito!')
      text: message, // El mensaje que se pasa como argumento
      icon: 'success', // Tipo de icono (exitoso)
      confirmButtonText: 'Aceptar', // Texto del botón de confirmación
    });
  }

  // Alerta de error
  error(message: string, title: string = '¡Error!') {
    Swal.fire({
      title: title, // Título de la alerta (por defecto '¡Error!')
      text: message, // El mensaje de error que se pasa como argumento
      icon: 'error', // Tipo de icono (error)
      confirmButtonText: 'Aceptar', // Texto del botón de confirmación
    });
  }

  // Alerta de advertencia
  warning(message: string, title: string = '¡Advertencia!') {
    Swal.fire({
      title: title, // Título de la alerta (por defecto '¡Advertencia!')
      text: message, // El mensaje de advertencia
      icon: 'warning', // Tipo de icono (advertencia)
      confirmButtonText: 'Aceptar', // Texto del botón de confirmación
    });
  }

  // Alerta informativa 
  info(message: string, title: string = 'Información') {
    Swal.fire({
      title: title, // Título de la alerta (por defecto 'Información')
      text: message, // El mensaje informativo
      icon: 'info', // Tipo de icono (informativo)
      confirmButtonText: 'Entendido', // Texto más suave para el botón
    });
  }

  // Alerta de confirmación (Sí o No)
  confirm(message: string, title: string = '¿Estás seguro?') {
    return Swal.fire({
      title: title, // Título de la alerta (por defecto '¿Estás seguro?')
      text: message, // El mensaje de confirmación
      icon: 'question', // Tipo de icono (pregunta)
      showCancelButton: true, // Muestra el botón de cancelación
      confirmButtonText: 'Sí', // Texto del botón de confirmación
      cancelButtonText: 'No', // Texto del botón de cancelación
    });
  }

  // Alerta con entrada de texto
  input(message: string, title: string = 'Por favor ingresa algo') {
    return Swal.fire({
      title: title, // Título de la alerta (por defecto 'Por favor ingresa algo')
      text: message, // El mensaje que se pasa como argumento
      input: 'text', // Tipo de entrada (texto)
      inputPlaceholder: 'Escribe aquí...', // Texto del placeholder para la entrada
      showCancelButton: true, // Muestra el botón de cancelación
      confirmButtonText: 'Aceptar', // Texto del botón de confirmación
      cancelButtonText: 'Cancelar', // Texto del botón de cancelación
    });
  }
}
