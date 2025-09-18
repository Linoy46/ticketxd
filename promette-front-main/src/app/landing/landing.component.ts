import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { ContactAltComponent } from './components/contact-alt/contact-alt.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { QuickAccessAltComponent } from './components/quick-access-alt/quick-access-alt.component';
import { SectionDividerComponent } from './components/section-divider/section-divider.component';

@Component({
  selector: 'app-landing',
  imports: [
    RouterModule,
    AboutComponent,
    ContactAltComponent,
    FooterComponent,
    NavbarComponent,
    QuickAccessAltComponent,
    SectionDividerComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  scrollPosition = 0;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.scrollPosition = window.pageYOffset;
    this.applyScrollEffect();
  }

  applyScrollEffect() {
    const flower = document.querySelector('.scroll-flower') as HTMLElement;
    if (flower) {
      const scale = 1 + this.scrollPosition * 0.0222;
      const opacity = Math.max(0, 1 - this.scrollPosition * 0.0015);
      flower.style.transform = `translate(-50%, -50%) scale(${scale})`;
      flower.style.opacity = `${opacity}`;

      // Ocultar completamente la flor cuando la opacidad llegue a 0
      if (opacity <= 0) {
        setTimeout(() => {
          flower.style.display = 'none';
        }, 100); // Esperar a que termine la transición
      } else {
        flower.style.display = 'block';
      }
    }
  }
}
