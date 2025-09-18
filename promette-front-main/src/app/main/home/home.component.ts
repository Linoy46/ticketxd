import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';
import { HomeService } from './services/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, CardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Datos del usuario
  userName: string = '';
  lastLogin: string | null = null;

  // Características del sistema para mostrar en tarjetas
  systemFeatures = [
    {
      title: 'Rápido y Eficiente',
      description:
        'Interfaz optimizada para máximo rendimiento y rapidez en todos los procesos administrativos.',
      icon: 'bi-lightning-charge',
    },
    {
      title: 'Seguro',
      description:
        'Protección avanzada de datos y privacidad con los más altos estándares de seguridad gubernamental.',
      icon: 'bi-shield-check',
    },
    {
      title: 'Fácil de Usar',
      description:
        'Diseño intuitivo y amigable para todos los usuarios, sin importar su nivel técnico.',
      icon: 'bi-person-check',
    },
  ];

  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    // Obtener datos del usuario desde Redux
    const user = this.userSelector();
    if (user) {
      this.userName = `${user.name || ''} ${user.apellidoPaterno || ''}`.trim();
      // Obtener la última fecha de inicio de sesión
      this.getLastLogin();
    }
  }

  // Método para obtener la última fecha de inicio de sesión
  getLastLogin(): void {
    this.homeService.getLastLogin().subscribe({
      next: (data) => {
        if (data && data.lastLogin) {
          this.lastLogin = new Date(data.lastLogin).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      },
      error: (err) => {
        console.error(
          'Error al obtener la última fecha de inicio de sesión',
          err
        );
      },
    });
  }
}
