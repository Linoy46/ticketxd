import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('600ms ease-out', style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  darkMode = false;

  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme');
  }

  ngOnInit() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode = true;
      document.body.classList.add('dark-theme');
    }
  }
}
