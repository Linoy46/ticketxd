import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthLoginService } from '../../services/auth.login.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { LottieAnimationComponent } from '../../../../shared/shared-lottie-animation/shared-lottie-animation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'auth-forgot-password-component',
  templateUrl: './auth-forgot-password.component.html',
  styleUrls: ['./auth-forgot-password.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FloatLabelModule,
    InputTextModule,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class AuthForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthLoginService,
    private router: Router,
    private alertService: CoreAlertService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.authService
        .forgotPassword(this.forgotPasswordForm.value.email)
        .subscribe((success) => {
          if (success) {
            this.router.navigate(['/auth/login']);
          } else {
            this.alertService.warning(
              'Error al intentar restablecer contraseña'
            );
          }
        });
    }
  }
}
