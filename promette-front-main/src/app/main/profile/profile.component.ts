import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PreofileService } from './services/profile.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormsModule,
} from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import {
  validateMultipleFields,
  ValidatorsPatterns,
} from '../../core/helpers/validators';
import { CoreLoadingService } from '../../core/services/core.loading.service';

import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { DatePicker } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { CoreAlertService } from '../../core/services/core.alert.service';
import { parseISO, startOfDay } from 'date-fns';
import {
  getBirthDateFromCURP,
  getGenderFromCURP,
} from '../../core/helpers/extractInfoCurp';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'profile-component',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    CommonModule,
    InputTextModule,
    KeyFilterModule,
    ButtonModule,
    FloatLabelModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    TabsModule,
    FormsModule,
  ],
})
export class ProfileComponent implements OnInit {
  puesto_hellpper: string = '';
  estado_civil_hellpper: string = '';
  codigosPostales: string[] = [];
  colonias: string[] = [];
  puestos: string[] = [];
  estados_civiles: string[] = [];
  originalEstados_civiles: string[] = [];
  originalPuestos: string[] = [];
  originalColonias: string[] = [];
  tab: String = '0';
  tabs: { title: string; value: string }[] = [];
  profileForm: FormGroup;
  profileImage: string | ArrayBuffer | null = null; // Variable para la imagen
  selectedFile: File | null = null; // Para almacenar el archivo de imagen seleccionado
  dataUser: any = {}; // Contendrá la información del usuario
  showPassword: boolean = false; // Propiedad para controlar la visibilidad de la contraseña en promette/profile
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  changeTab(tab: string): void {
    this.tab = tab;
  }
  // Método para actualizar la contraseña en promette/profile
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
      };
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (
      this.selectedFile &&
      this.dataUser.informacion_rupeet?.datos_personales?.id_informacion_rupeet
    ) {
      const ct_documento_id = 15; // Valor fijo o dinámico
      const id_informacion_rupeet =
        this.dataUser.informacion_rupeet.datos_personales.id_informacion_rupeet;

      // Llama al servicio para subir la imagen
      this.profileService
        .uploadImage(this.selectedFile, ct_documento_id, id_informacion_rupeet)
        .subscribe(() => {
          this.loadUserData();
        });
    } else {
      console.error(
        'No se ha seleccionado un archivo o falta información del usuario.'
      );
    }
  }

  // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  constructor(
    private profileService: PreofileService,
    private fb: FormBuilder,
    private loading: CoreLoadingService,
    private alert: CoreAlertService
  ) {
    this.profileForm = this.fb.group({
      id_usuario: [],
      id_informacion_rupeet: [],
      nombre: [
        '',
        [Validators.required, Validators.pattern(ValidatorsPatterns.nombre)],
      ],
      apellido_materno: ['', [Validators.pattern(ValidatorsPatterns.nombre)]],
      apellido_paterno: [
        '',
        [Validators.required, Validators.pattern(ValidatorsPatterns.nombre)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          validateMultipleFields('email', [
            'email_institucional',
            'email_respaldo',
          ]),
        ],
      ],
      newPassword: [
        '',
        [
          Validators.maxLength(18),
          Validators.pattern(/^[a-zA-Z0-9]*$/), // Solo letras y números, sin caracteres especiales ni ñ
        ],
      ], // Campo para actualizar la nueva contraseña en promette/profile
      email_institucional: [
        '',
        [
          Validators.email,
          validateMultipleFields('email_institucional', [
            'email',
            'email_respaldo',
          ]),
        ],
      ],
      email_respaldo: [
        '',
        [
          Validators.email,
          validateMultipleFields('email_respaldo', [
            'email',
            'email_institucional',
          ]),
        ],
      ],
      nombre_usuario: ['', [Validators.required]],

      curp: [
        '',
        [Validators.required, Validators.pattern(ValidatorsPatterns.curp)],
      ],
      rfc: [
        '',
        [Validators.required, Validators.pattern(ValidatorsPatterns.rfc)],
      ],
      id_puesto: ['', [Validators.required]],
      nss: [
        '',
        [
          Validators.required,
          Validators.pattern(ValidatorsPatterns.seguroSocial),
        ],
      ],
      ct_estado_civil_id: ['', [Validators.required]],
      fecha_ingreso_sep: ['', [Validators.required]],
      domicilios: this.fb.array([this.createDomicilio()]),
      telefono_personal: [
        '',
        [
          Validators.required,
          Validators.pattern(ValidatorsPatterns.telefono),
          validateMultipleFields('telefono_personal', [
            'telefono_casa',
            'telefono_trabajo',
          ]),
        ],
      ],
      telefono_casa: [
        '',
        [
          Validators.pattern(ValidatorsPatterns.telefono),
          validateMultipleFields('telefono_casa', [
            'telefono_personal',
            'telefono_trabajo',
          ]),
        ],
      ],
      telefono_trabajo: [
        '',
        [
          Validators.pattern(ValidatorsPatterns.telefono),
          validateMultipleFields('telefono_trabajo', [
            'telefono_personal',
            'telefono_casa',
          ]),
        ],
      ],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
    });
  }

  createDomicilio(): FormGroup {
    return this.fb.group({
      calle: ['', Validators.required], // Requiere una calle
      codigo_postal: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}$/), // Asegura que el código postal sea un número de 5 dígitos
        ],
      ],
      municipio: ['', Validators.required], // Requiere una estado,
      estado: ['', Validators.required], // Requiere una municipio,
      colonia: ['', Validators.required], // Requiere una colonia
      id_domicilio: [''], // Requiere el ID del domicilio
      numero_externo: [
        '',
        [Validators.required, Validators.pattern(/^\d+$/)], // Solo números para el número externo
      ],
      numero_interno: [
        '',
        [Validators.pattern(/^\d+$/)], // Solo números para el número interno (puede ser opcional)
      ],
    });
  }

  get domicilios(): FormArray {
    return this.profileForm.get('domicilios') as FormArray;
  }

  addDomicilio(): void {
    this.domicilios.push(this.createDomicilio());
    // Deshabilitar los controles 'estado' y 'municipio' para cada domicilio
    ['estado', 'municipio'].forEach((field) => {
      // Itera sobre el FormArray y deshabilita los controles
      for (let i = 0; i < this.domicilios.length; i++) {
        const control = (this.domicilios.at(i) as FormGroup).get(field);
        if (control) {
          control.disable();
        }
      }
    });
  }

  removeDomicilio(index: number): void {
    this.domicilios.removeAt(index);
  }

  // Método para cargar los datos del usuario cuando el componente se inicializa
  ngOnInit(): void {
    this.tabs = [{ title: 'Datos personales', value: '0' }]; // Remove documents tab
    this.loadUserData();
    // After loading data, disable all form controls
    this.profileForm.disable();
    // Se activa el campo de nueva contraseña
    this.profileForm.get('newPassword')?.enable();

    // Remove documents tab handling since it's no longer needed
    if (this.dataUser?.informacion_rupeet) {
      this.profileService
        .fetchFile(
          this.dataUser.informacion_rupeet?.datos_personales
            .id_informacion_rupeet
        )
        .subscribe((imageUrl) => {
          this.profileImage = imageUrl;
        });
    }
  }

  // Método para cargar los datos del usuario
  loadUserData() {
    this.codigosPostales = [];
    this.colonias = [];
    this.originalColonias = [];
    this.loading.show();
    const user = this.user;
    if (user && user.curp) {
      this.profileService.getInfo(user.curp).subscribe({
        next: (data: any) => {
          // Verificar que existen los datos necesarios antes de cargar la imagen
          if (
            data &&
            data.informacion_rupeet?.datos_personales?.id_informacion_rupeet
          ) {
            console.log(
              'Solicitando imagen de perfil con ID:',
              data.informacion_rupeet.datos_personales.id_informacion_rupeet
            );

            this.profileService
              .fetchFile(
                data.informacion_rupeet.datos_personales.id_informacion_rupeet
              )
              .subscribe({
                next: (imageUrl) => {
                  if (imageUrl) {
                    this.profileImage = imageUrl;
                    console.log('Imagen cargada correctamente');
                  }
                },
                error: (error) => {
                  console.error('Error al cargar la imagen de perfil:', error);
                  // No mostrar alerta, solo registrar el error
                },
              });
          }

          if (!data.informacion_rupeet) {
            this.alert.warning(
              'Completa tu información para poder continuar con la captura de documentos'
            );
          } else {
            this.tabs[1] = { title: 'Documentos', value: '1' };
          }

          let fechaIngreso = data.informacion_rupeet?.datos_personales
            .fecha_ingreso_sep
            ? parseISO(
                data.informacion_rupeet?.datos_personales.fecha_ingreso_sep
              )
            : new Date();
          fechaIngreso = startOfDay(fechaIngreso);

          this.profileForm.patchValue({
            id_usuario: data.id_usuario,
            id_informacion_rupeet:
              data.informacion_rupeet?.datos_personales.id_informacion_rupeet,
            nombre_usuario: data.nombre_usuario,
            nombre: data.informacion_rupeet?.datos_personales.nombre,
            apellido_materno:
              data.informacion_rupeet?.datos_personales.apellido_materno,
            apellido_paterno:
              data.informacion_rupeet?.datos_personales.apellido_paterno,
            curp: data.curp,
            rfc: data.informacion_rupeet?.datos_personales.rfc,
            fechaNacimiento: getBirthDateFromCURP(data.curp),
            genero: getGenderFromCURP(data.curp),
            email: data.email,
            email_institucional:
              data.informacion_rupeet?.datos_personales.email_institucional,
            email_respaldo:
              data.informacion_rupeet?.datos_personales.email_respaldo,
            telefono_personal: data.telefono,
            telefono_casa:
              data.informacion_rupeet?.datos_personales.telefono_casa || '',
            telefono_trabajo:
              data.informacion_rupeet?.datos_personales.telefono_trabajo || '',
            nss: data.informacion_rupeet?.datos_personales.nss || '',
            id_puesto:
              data.informacion_rupeet?.datos_personales.id_puesto || '',
            ct_estado_civil_id:
              data.informacion_rupeet?.datos_personales.ct_estado_civil_id,
            fecha_ingreso_sep: fechaIngreso,
          });

          this.estado_civil_hellpper =
            data.informacion_rupeet?.datos_personales.estado_civil;
          this.profileService
            .getPuestosId(data.informacion_rupeet?.datos_personales.id_puesto)
            .subscribe(({ position }) => {
              this.puesto_hellpper = position.nombre_puesto;
            });

          this.domicilios.clear();

          data.informacion_rupeet?.domicilios.forEach((domicilio: any) => {
            this.profileService
              .getInfoPostalCode(domicilio.codigo_postal)
              .subscribe((data) => {
                if (data) {
                  this.originalColonias = data.colonias;
                }

                this.domicilios.push(
                  this.fb.group({
                    calle: [domicilio.calle || '', Validators.required],
                    codigo_postal: [
                      domicilio.codigo_postal || '',
                      [Validators.required, Validators.pattern(/^\d{5}$/)],
                    ],
                    colonia: [domicilio.colonia || '', Validators.required],
                    estado: [data.estado || '', Validators.required],
                    municipio: [data.municipio || '', Validators.required],
                    id_domicilio: domicilio.id_domicilio || '',
                    numero_externo: [
                      domicilio.numero_externo || '',
                      Validators.required,
                    ],
                    numero_interno: [domicilio.numero_interno || ''],
                  })
                );

                ['estado', 'municipio'].forEach((field) => {
                  for (let i = 0; i < this.domicilios.length; i++) {
                    const control = (this.domicilios.at(i) as FormGroup).get(
                      field
                    );
                    if (control) {
                      control.disable();
                    }
                  }
                });
              });
          });

          ['fechaNacimiento', 'genero', 'curp'].forEach((field) => {
            this.profileForm.get(field)?.disable();
          });
          this.dataUser = data;
        },
        error: (error: any) => {
          console.error('Error al obtener la información del usuario:', error);
          this.loading.hide();
        },
      });
    } else {
      setTimeout(() => {
        this.loadUserData();
      }, 1000);
    }
  }

  // Remove onSubmit method since form is read-only

  search(event: AutoCompleteCompleteEvent, i: number) {
    this.colonias = [];
    this.originalColonias = [];
    if (event.query) {
      this.domicilios.at(i).get('colonia')?.patchValue('');
    }
    const query = event.query
      ? event.query
      : this.dataUser.informacion_rupeet.domicilios[i].codigo_postal;

    if (query) {
      this.profileService.getPostalCode(query).subscribe((data) => {
        if (data.length > 0) {
          this.codigosPostales = data;
        }
      });

      this.profileService.getInfoPostalCode(query).subscribe((data) => {
        if (data) {
          this.originalColonias = data.colonias;
          this.domicilios.at(i).get('estado')?.patchValue(data.estado);
          this.domicilios.at(i).get('municipio')?.patchValue(data.municipio);
        }
      });
    } else {
      this.codigosPostales = [...this.codigosPostales];
    }
  }

  findInfoPostalCode(event: AutoCompleteSelectEvent, i: number) {
    this.profileService.getInfoPostalCode(event.value).subscribe((data) => {
      if (data) {
        this.originalColonias = data.colonias;
        this.domicilios.at(i).get('estado')?.patchValue(data.estado);
        this.domicilios.at(i).get('municipio')?.patchValue(data.municipio);
      }
    });
  }

  searchColonias(event: AutoCompleteCompleteEvent) {
    if (event.query) {
      this.colonias = this.colonias.filter((col) =>
        col.toLowerCase().includes(event.query.toLowerCase())
      );
    } else {
      this.colonias = [...this.originalColonias];
    }
  }

  // Remove searchPuesto and searchPuestoSelect methods since puesto selection is removed

  searchEstadoCivil(event: AutoCompleteCompleteEvent) {
    this.profileService
      .getEstadoCivil(event.query ? event.query : 'a')
      .subscribe((data) => {
        if (data) {
          this.estados_civiles = data.civilStatus;
        }
      });
  }

  searchEstadoCivilSelect(event: AutoCompleteSelectEvent) {
    this.profileForm
      .get('ct_estado_civil_id')
      ?.patchValue(event.value.id_estado_civil);
  }
  // Método para actualizar la contraseña en promette/profile
  updatePassword(): void {
    const newPassword = this.profileForm.get('newPassword')?.value;

    if (!newPassword) {
      this.alert.error('Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      this.alert.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword.length > 18) {
      this.alert.error('La contraseña no puede tener más de 18 caracteres');
      return;
    }

    // Validar que solo contenga letras y números (sin caracteres especiales ni ñ)
    const pattern = /^[a-zA-Z0-9]*$/;
    if (!pattern.test(newPassword)) {
      this.alert.error(
        'La contraseña solo puede contener letras y números (sin caracteres especiales)'
      );
      return;
    }

    this.profileService.updatePassword(newPassword).subscribe({
      next: (response) => {
        if (response) {
          // Limpia el campo de la nueva contraseña después de actualizar exitosamente
          this.profileForm.get('newPassword')?.setValue('');
        }
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
      },
    });
  }

  editProfile() {
    window.location.href = 'https://dev.septlaxcala.gob.mx/rupeet/';
  }
}
