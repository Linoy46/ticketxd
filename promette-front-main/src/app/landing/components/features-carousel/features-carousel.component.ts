import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { trigger, transition, style, animate } from '@angular/animations';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-features-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './features-carousel.component.html',
  styleUrls: ['./features-carousel.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesCarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('carousel') carouselElement!: ElementRef;

  features: Feature[] = [
    {
      title: 'Gestión Eficiente',
      description: 'Administra tu información profesional de manera sencilla y efectiva.',
      icon: 'pi pi-cog'
    },
    {
      title: 'Seguimiento Integral',
      description: 'Mantén un registro actualizado de tu desarrollo profesional.',
      icon: 'pi pi-chart-line'
    },
    {
      title: 'Acceso Digital',
      description: 'Toda tu información disponible en un solo lugar.',
      icon: 'pi pi-cloud'
    },
    {
      title: 'Automatización',
      description: 'Procesos optimizados para mayor eficiencia.',
      icon: 'pi pi-bolt'
    },
    {
      title: 'Reportes Detallados',
      description: 'Análisis completo de tu desarrollo profesional.',
      icon: 'pi pi-chart-bar'
    }
  ];

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  carouselWidth = 0;
  maxScroll = 0;

  private autoScrollInterval: any;
  private scrollDirection: 'left' | 'right' = 'right';
  private isUserInteracting = false;
  private readonly SCROLL_AMOUNT = 1;
  private readonly SCROLL_INTERVAL = 30;
  private readonly DIRECTION_CHANGE_DELAY = 2000;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.calculateDimensions();
    // Ejecutar el auto-scroll fuera de la zona de Angular
    this.ngZone.runOutsideAngular(() => {
      this.startAutoScroll();
    });
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateDimensions();
  }

  private startAutoScroll() {
    this.stopAutoScroll();
    this.autoScrollInterval = this.ngZone.runOutsideAngular(() => {
      return setInterval(() => {
        if (!this.isUserInteracting && this.carouselElement) {
          const carousel = this.carouselElement.nativeElement;
          const maxScroll = carousel.scrollWidth - carousel.clientWidth;

          if (this.scrollDirection === 'right') {
            if (carousel.scrollLeft >= maxScroll - 1) {
              this.ngZone.run(() => {
                this.changeDirection();
                this.cdr.detectChanges();
              });
            } else {
              carousel.scrollLeft += this.SCROLL_AMOUNT;
            }
          } else {
            if (carousel.scrollLeft <= 1) {
              this.ngZone.run(() => {
                this.changeDirection();
                this.cdr.detectChanges();
              });
            } else {
              carousel.scrollLeft -= this.SCROLL_AMOUNT;
            }
          }
        }
      }, this.SCROLL_INTERVAL);
    });
  }

  private stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  private changeDirection() {
    this.stopAutoScroll();
    this.ngZone.run(() => {
      setTimeout(() => {
        this.scrollDirection = this.scrollDirection === 'right' ? 'left' : 'right';
        this.startAutoScroll();
        this.cdr.markForCheck();
      }, this.DIRECTION_CHANGE_DELAY);
    });
  }

  calculateDimensions() {
    if (this.carouselElement) {
      const carousel = this.carouselElement.nativeElement;
      this.carouselWidth = carousel.offsetWidth;
      this.maxScroll = carousel.scrollWidth - carousel.offsetWidth;
    }
  }

  onMouseDown(e: MouseEvent) {
    this.ngZone.run(() => {
      this.isUserInteracting = true;
      this.isDragging = true;
      this.startX = e.pageX - this.carouselElement.nativeElement.offsetLeft;
      this.scrollLeft = this.carouselElement.nativeElement.scrollLeft;
      this.carouselElement.nativeElement.style.cursor = 'grabbing';
      this.cdr.markForCheck();
      e.preventDefault();
    });
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const x = e.pageX - this.carouselElement.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.carouselElement.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp() {
    this.isDragging = false;
    this.carouselElement.nativeElement.style.cursor = 'grab';
    this.ngZone.run(() => {
      setTimeout(() => {
        this.isUserInteracting = false;
        this.cdr.markForCheck();
      }, 1000);
    });
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.carouselElement.nativeElement.style.cursor = 'grab';
      this.ngZone.run(() => {
        setTimeout(() => {
          this.isUserInteracting = false;
          this.cdr.markForCheck();
        }, 1000);
      });
    }
  }

  onTouchStart(e: TouchEvent) {
    this.isUserInteracting = true;
    this.isDragging = true;
    this.startX = e.touches[0].pageX - this.carouselElement.nativeElement.offsetLeft;
    this.scrollLeft = this.carouselElement.nativeElement.scrollLeft;
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    const x = e.touches[0].pageX - this.carouselElement.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.carouselElement.nativeElement.scrollLeft = this.scrollLeft - walk;
    e.preventDefault();
  }

  onTouchEnd() {
    this.isDragging = false;
    setTimeout(() => {
      this.isUserInteracting = false;
    }, 1000);
  }
}
