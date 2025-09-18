import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { AdministrativeService } from '../services/administrative.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { AdministrativeUnit } from '../interfaces/administrative.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Importaciones de PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    RadioButtonModule,
    TooltipModule,
  ],
})
export class FormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  mode!: 'assign' | 'view' | 'edit';
  analystId!: number;
  users: any[] = [];
  administrativeUnits: AdministrativeUnit[] = [];
  title = '';
  loadingUsers = false;
  loadingAdminUnits = false;
  administrativeUnitId!: number;
  administrativeUnitName: string = '';
  
  parametroArea: 'id_area_fin' | 'ct_area_id' = 'id_area_fin'; // Valor por defecto, cambiar según necesidad

  private destroy$ = new Subject<void>();
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  areas: any;

  get user() {
    return this.userSelector();
  }

  get puedeVerSelectUnidadAdmin(): boolean {
    // El usuario puede tener varios puestos, revisamos si alguno es 258 o 1806
    const puestos = this.user?.rl_usuario_puestos || [];
    return puestos.some((p: any) => p.ct_puesto_id === 258 || p.ct_puesto_id === 1806);
  }

  constructor(
    private fb: FormBuilder,
    private modalService: CoreModalService,
    private adminService: AdministrativeService,
    private alertService: CoreAlertService,
    private loadingService: CoreLoadingService
  ) {}

  ngOnInit(): void {
    this.initForm();

    try {
      const modalData = this.modalService.getData();
      console.log('Modal data obtenido:', modalData);

      if (modalData && modalData.data) {
        this.mode = modalData.data.mode || 'assign';
        this.analystId = modalData.data.analystId;
        this.administrativeUnitId = modalData.data.administrativeUnitId;
        this.administrativeUnitName =
          modalData.data.administrativeUnitName || '';
      } else {
        this.mode = 'assign';
      }

      // Si tenemos una unidad administrativa, actualizar el formulario
      if (this.administrativeUnitId) {
        this.form.addControl(
          'rl_area_financiero_id',
          new FormControl(this.administrativeUnitId)
        );
      } else {
        // Si no tenemos una unidad administrativa predefinida, agregamos el control para seleccionarla
        this.form.addControl('rl_area_financiero_id', new FormControl(null));
      }

      // Iniciar con estado de carga activo
      this.loadingUsers = true;
      this.loadingAdminUnits = true;

      // Timeout para asegurarnos que se inicialice correctamente el estado de carga
      setTimeout(() => {
        this.cargarDatos();
      }, 100);

      // Si estamos en modo vista, deshabilitamos el formulario después de cargar datos
      if (this.mode === 'view') {
        setTimeout(() => {
          this.form.disable();
        }, 0);
      }

      this.setTitle();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.mode = 'assign';
      this.form.addControl('rl_area_financiero_id', new FormControl(null));
      this.cargarDatos();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      ct_usuario_id: [null, Validators.required],
      estado: [true, Validators.required], // Sin el comentario que causa el error
    });
  }

  setTitle() {
    switch (this.mode) {
      case 'assign':
        this.title = 'Asignar Analista';
        break;
      case 'edit':
        this.title = 'Editar Analista';
        break;
      case 'view':
        this.title = 'Ver Analista';
        break;
    }
  }

  /**
   * Obtiene el nombre del área seleccionada
   * @returns Nombre del área seleccionada o placeholder
   */
  getSelectedAreaName(): string {
    if (!this.form.get('ct_area_id')?.value) return '';

    const selectedAreaId = this.form.get('ct_area_id')?.value;
    const selectedArea = this.areas.find(
      (area: { id_area: any }) => area.id_area === selectedAreaId
    );

    return selectedArea ? selectedArea.nombre_area : 'Seleccione un área';
  }

  cargarDatos(): void {
    this.loadingService.show();

    // Cargar unidades administrativas si no tenemos una predefinida
    if (!this.administrativeUnitId) {
      this.adminService
        .getAdministrativeUnits()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response && response.administrativeUnits) {
              this.administrativeUnits = response.administrativeUnits.map(unit => ({
                ...unit,
                nombre_area: unit.nombre // fuerza que siempre exista nombre_area
              }));
            } else {
              this.administrativeUnits = [];
            }
            this.loadingAdminUnits = false;
          },
          error: (error) => {
            this.loadingAdminUnits = false;
            console.error('Error al cargar unidades administrativas:', error);
            this.alertService.error(
              'Error al cargar las unidades administrativas'
            );
          },
        });
    }

    // Simplificar la carga de usuarios para evitar problemas
    this.adminService
      .getUsersBySpecificPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userResponse) => {
          if (userResponse?.users) {
            this.users = userResponse.users.map((user) => ({
              id_usuario: user.id_usuario,
              nombre_usuario: user.nombre_usuario || 'Usuario sin nombre',
              email: user.email || 'Sin correo',
              puesto: user.puesto || 'Sin puesto',
            }));
          } else {
            this.users = [];
          }
          this.loadingUsers = false;

          // Cargar datos del analista solo después de cargar usuarios
          if (
            (this.mode === 'edit' || this.mode === 'view') &&
            this.analystId
          ) {
            this.cargarAnalista();
          } else {
            this.loadingService.hide();
          }
        },
        error: (error) => {
          this.loadingUsers = false;
          console.error('Error al cargar usuarios:', error);
          this.alertService.error('Error al cargar los usuarios');
          this.loadingService.hide();
        },
      });
  }

  cargarAnalista(): void {
    this.adminService
      .getAnalystById(this.analystId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analystResponse) => {
          if (analystResponse?.analyst) {
            const analyst = analystResponse.analyst;
            console.log('Analista cargado:', analyst);

            const estadoValue = Boolean(
              typeof analyst.estado === 'boolean'
                ? analyst.estado
                : analyst.estado === 1
            );

            setTimeout(() => {
              this.form.patchValue({
                ct_usuario_id: analyst.ct_usuario_id,
                estado: estadoValue,
                rl_area_financiero_id: analyst.rl_area_financiero_rl_area_financiero?.id_area_fin || null,
              });

              // Si el analista tiene una unidad administrativa asociada y no tenemos una predefinida
              if (analyst.rl_area_financiero_rl_area_financiero?.id_area_fin && !this.administrativeUnitId) {
                // Buscar el nombre de la unidad administrativa
                const adminUnit = this.administrativeUnits.find(
                  (unit) => unit.id_area_fin === analyst.rl_area_financiero_rl_area_financiero?.id_area_fin
                );
                if (adminUnit) {
                  this.administrativeUnitName = adminUnit.nombre || '';
                }
              }
            }, 0);
          }
        },
        error: (error) => {
          console.error('Error al cargar analista:', error);
          if (this.mode === 'edit' || this.mode === 'view') {
            this.alertService.error('Error al cargar datos del analista');
          }
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  /**
   * Devuelve el valor de estado como booleano para la UI
   */
  getEstadoValue(): boolean {
    const value = this.form.get('estado')?.value;
    return Boolean(value); // Conversión explícita a boolean
  }

  /**
   * Maneja el cambio en el switch de estado
   */
  onEstadoChange(event: any): void {
    const isChecked = Boolean(event.target.checked);
    this.form.get('estado')?.setValue(isChecked);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.alertService.warning(
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    // Get form values
    const formValues = this.form.value;

    const data = {
      ...formValues,
      estado: formValues.estado === true ? 1 : 0,
      ct_usuario_in: this.user.id_usuario,
    };

    // Map the field name for the backend
    if (this.administrativeUnitId) {
      data.rl_area_financiero_id = this.administrativeUnitId;
    } else if (data.rl_area_financiero_id) {
      // Keep it as is - the controller will map it to rl_area_financiero
    }

    this.loadingService.show();

    if (this.mode === 'edit') {
      data.id_puesto_unidad = this.analystId;
      data.ct_usuario_at = this.user.id_usuario;

      this.adminService
        .updateAnalyst(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alertService.success('Analista actualizado correctamente');
            this.close(true);
          },
          error: (error) => {
            console.error('Error al actualizar analista:', error);
            this.alertService.error('Error al actualizar el analista');
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          },
        });
    } else {
      this.adminService
        .registerAnalyst(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alertService.success('Analista asignado correctamente');
            this.close(true);
          },
          error: (error) => {
            console.error('Error al asignar analista:', error.error.msg);
            this.alertService.error(error.error.msg);
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          },
        });
    }
  }

  close(refresh = false): void {
    try {
      const modalData = this.modalService.getData();
      if (refresh && modalData?.data?.loadData) {
        modalData.data.loadData();
      }
    } catch (error) {
      console.error('Error al cerrar el modal:', error);
    } finally {
      this.modalService.close();
    }
  }
}
