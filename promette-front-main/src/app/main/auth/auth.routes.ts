import { Routes } from '@angular/router'; // Importación del módulo para definir las rutas
import { AuthComponent } from './auth.component'; // Componente principal de la sección de autenticación

import { AuthForgotPasswordComponent } from './pages/auth-forgot-password/auth-forgot-password.component'; // Componente para recuperación de contraseña
import { AuthRegisterComponent } from './pages/auth-register/auth-register.component'; // Componente para registro de nuevos usuarios
import { CoreLoginGuard } from '../../core/guards/core.login.guard';
import { AuthLoginComponent } from './pages/auth-login/auth-login.component';
import { RestorePasswordComponent } from './pages/restore-password/restore-password.component';

// Definición de las rutas asociadas al módulo de autenticación
export const authRoutes: Routes = [
  {
    path: 'auth', // Ruta base para las páginas de autenticación
    component: AuthComponent, // Componente principal para la sección de autenticación
    canActivate: [CoreLoginGuard], // El guard LoginGuard protege esta ruta para evitar que los usuarios autenticados accedan a estas páginas
    children: [
      { path: 'login', component: AuthLoginComponent }, // Ruta para el login
      { path: 'forgotPassword', component: AuthForgotPasswordComponent }, // Ruta para recuperar la contraseña
      { path: 'register', component: AuthRegisterComponent }, // Ruta para registrar un nuevo usuario
      { path: 'restorePassword/:token', component: RestorePasswordComponent }, // Ruta para registrar un nuevo usuario
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección predeterminada a 'login' si no se especifica ninguna subruta
    ],
  },
];
