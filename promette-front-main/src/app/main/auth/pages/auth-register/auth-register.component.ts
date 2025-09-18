import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormControl,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { AuthLoginService } from '../../services/auth.login.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { CleanObject } from '../../../../core/helpers/clenedObjects.helpers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgressBarModule } from 'primeng/progressbar'; // Change this import
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; // Añadir este import

interface Pais {
  codigo: string;
  nombre: string;
}

@Component({
  selector: 'auth-register-component',
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PasswordModule,
    DividerModule,
    FormsModule,
    ProgressBarModule,
    FloatLabelModule,
    InputTextModule,
    SelectModule,
  ],
})
export class AuthRegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  registerForm!: FormGroup;
  paises: Pais[] = [];
  value: string = '';
  confirmPassword: string = '';
  sexoOptions = [
    { codigo: 'H', nombre: 'Hombre' },
    { codigo: 'M', nombre: 'Mujer' },
  ];

  // Add new password control for p-Password component
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  ]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthLoginService,
    private alertService: CoreAlertService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadPaises();
    this.watchExtranjeroFields();
  }

  // Validación para que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (matchingControl?.errors && !matchingControl.errors['mustMatch'])
        return null;

      control?.value !== matchingControl?.value
        ? matchingControl?.setErrors({ mustMatch: true })
        : matchingControl?.setErrors(null);

      return null;
    };
  }

  validateField(field: string, value: string): void {
    this.authService.validateField(field, value).subscribe((response) => {
      console.log(response);
      if (response.msg === 'Campo en uso') {
        this.registerForm.get(field)?.setErrors({ fieldTaken: true });
      } else {
        this.registerForm.get(field)?.setErrors(null); // Limpia los errores si el campo está disponible
      }
    });
  }

  private generateCurpFromData(userData: any): string {
    // Obtener las primeras letras del primer apellido
    const apellido1 = userData.primerApellido.toUpperCase().slice(0, 2);

    // Obtener la primera letra del segundo apellido o X si no existe
    const apellido2 = 'X'; // Para extranjeros usamos X

    // Obtener la primera letra del nombre
    const nombre = userData.nombres.toUpperCase().charAt(0);

    // Obtener fecha de nacimiento en formato YYMMDD
    const fecha = new Date(userData.fechaNacimiento); // Corregido de fechaNacimineto a fechaNacimiento
    const anio = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    // Obtener sexo (H o M)
    const sexo = userData.sexo.toUpperCase();

    // Código de estado NE para extranjeros
    const estado = 'NE';

    // Consonantes internas
    const consonante1 = this.getPrimeraConsonanteInterna(
      userData.primerApellido
    );
    const consonante2 = 'X';
    const consonante3 = this.getPrimeraConsonanteInterna(userData.nombres);

    // Homoclave para extranjeros
    const homoclave = '01';

    return `${apellido1}${apellido2}${nombre}${anio}${mes}${dia}${sexo}${estado}${consonante1}${consonante2}${consonante3}${homoclave}`;
  }

  private getPrimeraConsonanteInterna(texto: string): string {
    if (!texto) return 'X';
    const consonantes = texto
      .toUpperCase()
      .replace(/[AEIOU]/g, '')
      .split('');
    return consonantes.length > 1 ? consonantes[1] : 'X';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      if (formData.isExtranjero) {
        // Generar CURP para extranjeros
        formData.curp = this.generateCurpFromData(formData);
      }

      const cleanedForm = CleanObject(formData, ['confirmPassword']);
      this.authService.register(cleanedForm).subscribe((success) => {
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

  loadPaises() {
    this.paises = [
      { codigo: 'AFG', nombre: 'Afganistán' },
      { codigo: 'ALB', nombre: 'Albania' },
      { codigo: 'DZA', nombre: 'Argelia' },
      { codigo: 'AND', nombre: 'Andorra' },
      { codigo: 'AGO', nombre: 'Angola' },
      { codigo: 'ARG', nombre: 'Argentina' },
      { codigo: 'ARM', nombre: 'Armenia' },
      { codigo: 'AUS', nombre: 'Australia' },
      { codigo: 'AUT', nombre: 'Austria' },
      { codigo: 'AZE', nombre: 'Azerbaiyán' },
      { codigo: 'BHS', nombre: 'Bahamas' },
      { codigo: 'BGD', nombre: 'Bangladés' },
      { codigo: 'BRB', nombre: 'Barbados' },
      { codigo: 'BEL', nombre: 'Bélgica' },
      { codigo: 'BLZ', nombre: 'Belice' },
      { codigo: 'BEN', nombre: 'Benín' },
      { codigo: 'BOL', nombre: 'Bolivia' },
      { codigo: 'BRA', nombre: 'Brasil' },
      { codigo: 'CAN', nombre: 'Canadá' },
      { codigo: 'CHL', nombre: 'Chile' },
      { codigo: 'CHN', nombre: 'China' },
      { codigo: 'COL', nombre: 'Colombia' },
      { codigo: 'CRI', nombre: 'Costa Rica' },
      { codigo: 'CUB', nombre: 'Cuba' },
      { codigo: 'DNK', nombre: 'Dinamarca' },
      { codigo: 'ECU', nombre: 'Ecuador' },
      { codigo: 'EGY', nombre: 'Egipto' },
      { codigo: 'SLV', nombre: 'El Salvador' },
      { codigo: 'ESP', nombre: 'España' },
      { codigo: 'USA', nombre: 'Estados Unidos' },
      { codigo: 'EST', nombre: 'Estonia' },
      { codigo: 'ETH', nombre: 'Etiopía' },
      { codigo: 'FJI', nombre: 'Fiyi' },
      { codigo: 'FIN', nombre: 'Finlandia' },
      { codigo: 'FRA', nombre: 'Francia' },
      { codigo: 'GEO', nombre: 'Georgia' },
      { codigo: 'DEU', nombre: 'Alemania' },
      { codigo: 'GHA', nombre: 'Ghana' },
      { codigo: 'GRC', nombre: 'Grecia' },
      { codigo: 'GTM', nombre: 'Guatemala' },
      { codigo: 'HND', nombre: 'Honduras' },
      { codigo: 'HUN', nombre: 'Hungría' },
      { codigo: 'IND', nombre: 'India' },
      { codigo: 'IDN', nombre: 'Indonesia' },
      { codigo: 'IRN', nombre: 'Irán' },
      { codigo: 'IRL', nombre: 'Irlanda' },
      { codigo: 'ISR', nombre: 'Israel' },
      { codigo: 'ITA', nombre: 'Italia' },
      { codigo: 'JPN', nombre: 'Japón' },
      { codigo: 'KAZ', nombre: 'Kazajistán' },
      { codigo: 'KEN', nombre: 'Kenia' },
      { codigo: 'KOR', nombre: 'Corea del Sur' },
      { codigo: 'LBN', nombre: 'Líbano' },
      { codigo: 'LUX', nombre: 'Luxemburgo' },
      { codigo: 'MEX', nombre: 'México' },
      { codigo: 'MNG', nombre: 'Mongolia' },
      { codigo: 'MAR', nombre: 'Marruecos' },
      { codigo: 'NLD', nombre: 'Países Bajos' },
      { codigo: 'NZL', nombre: 'Nueva Zelanda' },
      { codigo: 'NIC', nombre: 'Nicaragua' },
      { codigo: 'NGA', nombre: 'Nigeria' },
      { codigo: 'NOR', nombre: 'Noruega' },
      { codigo: 'PAK', nombre: 'Pakistán' },
      { codigo: 'PAN', nombre: 'Panamá' },
      { codigo: 'PRY', nombre: 'Paraguay' },
      { codigo: 'PER', nombre: 'Perú' },
      { codigo: 'PHL', nombre: 'Filipinas' },
      { codigo: 'POL', nombre: 'Polonia' },
      { codigo: 'PRT', nombre: 'Portugal' },
      { codigo: 'QAT', nombre: 'Catar' },
      { codigo: 'ROU', nombre: 'Rumania' },
      { codigo: 'RUS', nombre: 'Rusia' },
      { codigo: 'SAU', nombre: 'Arabia Saudita' },
      { codigo: 'SEN', nombre: 'Senegal' },
      { codigo: 'SGP', nombre: 'Singapur' },
      { codigo: 'ZAF', nombre: 'Sudáfrica' },
      { codigo: 'ESP', nombre: 'España' },
      { codigo: 'LKA', nombre: 'Sri Lanka' },
      { codigo: 'SWE', nombre: 'Suecia' },
      { codigo: 'CHE', nombre: 'Suiza' },
      { codigo: 'THA', nombre: 'Tailandia' },
      { codigo: 'TUR', nombre: 'Turquía' },
      { codigo: 'UKR', nombre: 'Ucrania' },
      { codigo: 'ARE', nombre: 'Emiratos Árabes Unidos' },
      { codigo: 'GBR', nombre: 'Reino Unido' },
      { codigo: 'URY', nombre: 'Uruguay' },
      { codigo: 'VEN', nombre: 'Venezuela' },
      { codigo: 'VNM', nombre: 'Vietnam' },
      { codigo: 'ZMB', nombre: 'Zambia' },
      { codigo: 'ZWE', nombre: 'Zimbabue' },
    ];
  }
  onExtranjeroChange(): void {
    const isExtranjero = this.registerForm.get('isExtranjero')?.value;

    if (isExtranjero) {
      // Activar validadores para campos de extranjeros
      this.registerForm.get('nombres')?.setValidators([Validators.required]);
      this.registerForm
        .get('primerApellido')
        ?.setValidators([Validators.required]);
      this.registerForm
        .get('fechaNacimiento')
        ?.setValidators([Validators.required]);
      this.registerForm.get('sexo')?.setValidators([Validators.required]);
      this.registerForm.get('paisOrigen')?.setValidators([Validators.required]);

      // Desactivar y limpiar CURP
      this.registerForm.get('curp')?.clearValidators();
      this.registerForm.get('curp')?.disable();
      this.registerForm.get('curp')?.setValue('');
    } else {
      // Restaurar validadores de CURP
      this.registerForm.get('curp')?.enable();
      this.registerForm
        .get('curp')
        ?.setValidators([
          Validators.required,
          Validators.pattern('^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}$'),
        ]);

      // Limpiar campos de extranjeros
      [
        'nombres',
        'primerApellido',
        'fechaNacimiento',
        'sexo',
        'paisOrigen',
      ].forEach((field) => {
        this.registerForm.get(field)?.clearValidators();
        this.registerForm.get(field)?.setValue('');
      });
    }

    // Actualizar validación del formulario
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.updateValueAndValidity();
    });
  }

  private watchExtranjeroFields(): void {
    if (this.registerForm) {
      // Cambios en los campos necesarios para generar CURP
      ['nombres', 'primerApellido', 'fechaNacimiento', 'sexo'].forEach(
        (field) => {
          this.registerForm
            .get(field)
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.tryGenerateCurp();
            });
        }
      );
    }
  }

  private tryGenerateCurp(): void {
    const requiredFields = [
      'nombres',
      'primerApellido',
      'fechaNacimiento',
      'sexo',
    ];
    const isValid = requiredFields.every(
      (field) =>
        this.registerForm.get(field)?.valid &&
        !!this.registerForm.get(field)?.value
    );

    if (isValid) {
      const formData = this.registerForm.value;
      const curp = this.generateCurpFromData(formData);
      this.registerForm.patchValue({ curp }, { emitEvent: false });
    }
  }

  // Remove old passwordErrors getter and getPasswordErrorMessage
  public getPasswordErrorMessage(): string {
    const errors = this.registerForm.get('contrasena')?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Contraseña requerida';
    if (errors['minlength']) return 'Mínimo 8 caracteres';
    if (errors['lowercase']) return 'Falta una minúscula';
    if (errors['uppercase']) return 'Falta una mayúscula';
    if (errors['number']) return 'Falta un número';
    return '';
  }

  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        nombre_usuario: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ], // Asegura que el teléfono tenga 10 dígitos
        curp: ['', [Validators.required]], // Validación básica para CURP
        contrasena: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.lowercaseValidator(),
            this.uppercaseValidator(),
            this.numberValidator(),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        // Datos para extranjero
        isExtranjero: [false],
        nombres: [''],
        primerApellido: [''],
        fechaNacimiento: [''], // Cambiar de fechaNacimineto a fechaNacimiento
        sexo: [''],
        paisOrigen: [''],
      },
      { validator: this.mustMatch('contrasena', 'confirmPassword') }
    );
  }

  private lowercaseValidator(): ValidatorFn {
    return (control: AbstractControl) =>
      /[a-z]/.test(control.value) ? null : { lowercase: true };
  }

  private uppercaseValidator(): ValidatorFn {
    return (control: AbstractControl) =>
      /[A-Z]/.test(control.value) ? null : { uppercase: true };
  }

  private numberValidator(): ValidatorFn {
    return (control: AbstractControl) =>
      /\d/.test(control.value) ? null : { number: true };
  }

  calculateStrength(value: string): number {
    if (!value) return 0;

    let strength = 0;

    // Longitud mínima
    if (value.length >= 8) strength += 20;

    // Contiene letras minúsculas
    if (/[a-z]/.test(value)) strength += 20;

    // Contiene letras mayúsculas
    if (/[A-Z]/.test(value)) strength += 20;

    // Contiene números
    if (/[0-9]/.test(value)) strength += 20;

    // Contiene caracteres especiales
    if (/[^A-Za-z0-9]/.test(value)) strength += 20;

    return strength;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
