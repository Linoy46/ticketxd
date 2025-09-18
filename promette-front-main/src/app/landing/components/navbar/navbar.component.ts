import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const header = document.querySelector('.header') as HTMLElement;
    if (window.scrollY > 100) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }

  isMobileMenuOpen: boolean = false;
  activeSection: string = 'hero'; // Sección inicial

  constructor(private scrollService: ScrollService, private router: Router) {}

  ngOnInit(): void {
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const sections = [
        'hero',
        'about',
        'features',
        'services',
        'faq',
        'contact',
      ];
      const scrollPosition =
        window.scrollY + (document.querySelector('.header')?.clientHeight || 0);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            this.activeSection = section;
            break;
          }
        }
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Obtener el elemento nav
    const navmenu = document.getElementById('navmenu');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');

    // Si el menú está abierto y el clic no fue dentro del nav ni en el botón toggle
    if (this.isMobileMenuOpen && navmenu && mobileToggle) {
      if (
        !navmenu.contains(event.target as Node) &&
        !mobileToggle.contains(event.target as Node)
      ) {
        this.closeMobileMenu();
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateMenuState();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateMenuState();
  }

  private updateMenuState(): void {
    const navmenu = document.getElementById('navmenu');
    if (navmenu) {
      if (this.isMobileMenuOpen) {
        navmenu.classList.add('navbar-mobile');
        document.body.classList.add('mobile-nav-active');
      } else {
        navmenu.classList.remove('navbar-mobile');
        document.body.classList.remove('mobile-nav-active');
      }
    }
  }

  navigateWithScroll(sectionId: string): void {
    this.closeMobileMenu();
    this.scrollService.smoothScroll(sectionId);
  }

  isLinkActive(link: string): boolean {
    // Verifica si la ruta actual coincide con el enlace
    return this.router.isActive(link, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
