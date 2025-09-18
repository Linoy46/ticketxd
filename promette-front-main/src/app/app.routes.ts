import { Routes } from '@angular/router'; // Importación de la interfaz Routes para definir las rutas

import { layoutRoutes } from './main/layout/layout.routes';
import { authRoutes } from './main/auth/auth.routes';

// Definición de las rutas principales de la aplicación
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  ...authRoutes,
  ...layoutRoutes,

  // Asegúrate de que esta ruta existe y apunta al componente de inventario
  {
    path: 'promette/inventory',
    loadComponent: () => import('./main/consumables/inventories/inventories.component').then(m => m.InventoriesComponent),
    title: 'Inventario'
  },

  { path: '**', redirectTo: 'auth' },
];
