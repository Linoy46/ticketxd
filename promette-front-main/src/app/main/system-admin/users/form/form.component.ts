import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { CommonModule } from '@angular/common';
import { ModalData } from '../interfaces/interfaces';
import { UsersService } from '../services/users.service';
import { AuthLoginService } from '../../../auth/services/auth.login.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CoreAlertService } from '../../../../core/services/core.alert.service';

@Component({
  selector: 'form-component',
  templateUrl: './form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,]
})
export class FormComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  @Input() data?: ModalData; // Modo del formulario
  @Input() close!: () => void;
  form: FormGroup;
  id_usuario: number | null = null; // ID del registro (para editar/ver)

  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authLoginService: AuthLoginService,
    private alertService: CoreAlertService,

  ) {
    this.form = this.fb.group({
      id_usuario: [],
      nombre_usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      email_institucional: ['', [Validators.required, Validators.email]],
      curp: ['', [Validators.required, Validators.pattern('^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$')]],
      ct_usuario_at: [this.user.id_usuario],
      ct_usuario_in: [this.user.id_usuario],
      estado: [],
      //edad: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    // Si estamos en modo editar o ver, obtenemos el ID del registro
    if (this.data?.mode === 'edit' || this.data?.mode === 'view') {
      this.loadData(this.data?.id_usuario);
    }

    // Si estamos en modo ver, deshabilitamos el formulario
    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Cargar un registro por ID
  loadData(id_usuario?: number) {
    if (id_usuario) {
      this.usersService.get(id_usuario).subscribe((record) => {
        this.form.patchValue({
          ...record.user,
          ct_usuario_at: this.user.id_usuario,
        });
        console.log("Record: ",record.registro)
      });
    }

  }

  // Enviar el formulario
  onSubmit() {
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.authLoginService.register(this.form.value).subscribe((success) => {
          if (!success) {
            this.alertService.warning('Error al crear el usuario');
          }
        });
        this.data?.loadData?.()
      }
      else if (this.data?.mode === 'edit' && this.data.id_usuario) {
        this.usersService.edit(this.data.id_usuario, this.form.value).subscribe((success) => {
          if (!success) {
            this.alertService.warning('Error al actualizar el usuario');
          }
        });
        this.data?.loadData?.()
      }
    }
  }


}


// ROZD000502HTLDRNA9
// LUGA981029HTLRRL09
