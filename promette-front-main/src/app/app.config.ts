import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLottieOptions } from 'ngx-lottie';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { AuthInterceptor } from './core/helpers/interceptor';
import { provideRedux } from '@reduxjs/angular-redux';
import { store } from './store';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { SharedActionsGridComponent } from './shared/shared-actions-grid/shared-actions-grid.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
registerLocaleData(es); // Esto habilita el idioma español

// Create a NgModule for the shared components that need to be available globally
@NgModule({
  declarations: [],
  imports: [
    SharedActionsGridComponent
  ],
  exports: [
    SharedActionsGridComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedComponentsModule {}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideRedux({ store }),
    provideHttpClient(withInterceptors([AuthInterceptor]), withFetch()),
    {provide: LOCALE_ID, useValue: 'es'},
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false,
        },
      },
    }),
    // Add Lottie configuration
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    importProvidersFrom(SharedComponentsModule)
  ],
};
