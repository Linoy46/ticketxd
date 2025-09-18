import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthLoginService } from '../../services/auth.login.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'restore-password-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PasswordModule,
    DividerModule,
    ProgressBarModule
  ],
  templateUrl: './restore-password.component.html',
  styleUrls: ['./restore-password.component.css'],
})
export class RestorePasswordComponent {
  restoreForm!: FormGroup;
  value: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthLoginService,
    private alertService: CoreAlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.restoreForm = this.fb.group({
      contrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        this.lowercaseValidator(),
        this.uppercaseValidator(),
        this.numberValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.mustMatch('contrasena', 'confirmPassword')
    });
  }

  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (matchingControl?.errors && !matchingControl.errors['mustMatch']) return null;

      control?.value !== matchingControl?.value
        ? matchingControl?.setErrors({ mustMatch: true })
        : matchingControl?.setErrors(null);

      return null;
    };
  }

  private lowercaseValidator(): ValidatorFn {
    return (control: AbstractControl) => /[a-z]/.test(control.value) ? null : { lowercase: true };
  }

  private uppercaseValidator(): ValidatorFn {
    return (control: AbstractControl) => /[A-Z]/.test(control.value) ? null : { uppercase: true };
  }

  private numberValidator(): ValidatorFn {
    return (control: AbstractControl) => /\d/.test(control.value) ? null : { number: true };
  }

  calculateStrength(value: string): number {
    if (!value) return 0;

    let strength = 0;

    if (value.length >= 8) strength += 20;
    if (/[a-z]/.test(value)) strength += 25;
    if (/[A-Z]/.test(value)) strength += 20;
    if (/[0-9]/.test(value)) strength += 20;
    if (/[^A-Za-z0-9]/.test(value)) strength += 20;

    return strength;
  }

  onSubmit(): void {
    const token: string = this.route.snapshot.paramMap.get('token') || '';
    if (this.restoreForm.valid) {
      this.authService
        .resetPassword(token, this.restoreForm.value.contrasena)
        .subscribe((success) => {
          if (success) {
            this.router.navigate(['/auth/login']);
          } else {
            this.alertService.warning('Error al registrarse');
          }
        });
    } else {
      this.alertService.warning('Revise los datos del formulario');
    }
  }
}
