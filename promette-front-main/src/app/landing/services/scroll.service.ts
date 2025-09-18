import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible globalmente
})
export class ScrollService {
    
  constructor(private router: Router) {}

  scrollToSection(sectionId: string, route: string) {
    // Si ya estamos en la ruta correcta
    if (this.router.url.includes(route)) {
      this.smoothScroll(sectionId);
    } else {
      // Navegamos a la ruta primero y luego hacemos scroll
      this.router.navigate([route]).then(() => {
        setTimeout(() => {
          this.smoothScroll(sectionId);
        }, 300); // Esperamos que el DOM cargue
      });
    }
  }

  smoothScroll(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = document.querySelector('.header')?.clientHeight || 0;
      const offsetPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn(`Elemento con ID ${sectionId} no encontrado`);
    }
  }
}
