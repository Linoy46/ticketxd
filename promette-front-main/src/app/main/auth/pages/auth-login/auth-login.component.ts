import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthLoginService } from '../../services/auth.login.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { HistoryService } from '../../../system-admin/history/services/history.service';

@Component({
  selector: 'auth-login-component',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FloatLabelModule,
    InputTextModule,
  ],
})
export class AuthLoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  @ViewChild('loginForm') loginForm2!: ElementRef;
  @ViewChild('registerForm') registerForm!: ElementRef;

  ngAfterViewInit() {
    this.setupTabs();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthLoginService,
    private historyService: HistoryService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { userName, password } = this.loginForm.value;

      this.authService.login(userName, password).subscribe((success) => {
        if (success) {
          this.router.navigate(['/promette']);
        }
      });
    }
  }
  private setupTabs(): void {
    const tabs = document.querySelectorAll('.iu-tab');
    const forms = [
      this.loginForm2.nativeElement,
      this.registerForm.nativeElement,
    ];
    const tabContainer = document.querySelector('.iu-tabs');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Animación de transición de pestañas
        tabContainer?.classList.remove('login-active', 'register-active');

        // Determinar qué animación aplicar
        if ((tab as HTMLElement).dataset['tab'] === 'login') {
          tabContainer?.classList.add('login-active');
        } else {
          tabContainer?.classList.add('register-active');
        }

        // Remover la clase 'active' de todas las pestañas
        tabs.forEach((t) => t.classList.remove('active'));
        // Añadir la clase 'active' a la pestaña clickeada
        tab.classList.add('active');

        // Ocultar todos los formularios con animación
        forms.forEach((form) => {
          form.classList.add('hidden');
          form.classList.remove('fade-in');
        });

        // Mostrar el formulario correspondiente con animación
        const formId = `${(tab as HTMLElement).dataset['tab']}Form`;
        const formToShow = document.getElementById(formId);
        if (formToShow) {
          formToShow.classList.remove('hidden');
          setTimeout(() => {
            formToShow.classList.add('fade-in');
          }, 10);
        }
      });
    });
  }
}
