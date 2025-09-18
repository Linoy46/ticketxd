import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalData } from './interfaces/interfaces';
import { ModuleAreasService } from './services/module-areas.service';
import { ModuleArea } from './interfaces/interfaces';
import { TreeNode } from 'primeng/api'; // Asegúrate de importar TreeNode de PrimeNG
import { Tree } from 'primeng/tree';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../../store';

@Component({
  selector: 'app-module-area',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FloatLabelModule,
    AutoComplete,
  ],
  templateUrl: './module-area.component.html',
  styleUrl: './module-area.component.css'
})

export class ModuleAreaComponent implements OnInit {
  public rowData: ModuleArea[] = [];
  @Input() data?: ModalData;
  @Input() close!: () => void;
  public modules: any[] = [];
  public selectedModule: any;
  public filteredModules!: any[];
  form: FormGroup;

  id: number | null = null; // ID del registro (para editar/ver)
  //files!: TreeNode[];

  //selectedFiles!: TreeNode[];

    private userSelector = injectSelector<RootState, any>(
        (state) => state.auth.user
      );
   // Aquí se obtiene el usuario con un getter
   get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }


  constructor(
    private cdr: ChangeDetectorRef, // Inyección para la detección de cambios
    private alertService: CoreAlertService,
    private fb: FormBuilder,
    private moduleAreasService: ModuleAreasService,
  ) {
    this.form = this.fb.group({
          ct_modulo: ['', Validators.required],
          ct_modulo_id: ['', Validators.required],
          ct_area_id: ['', Validators.required],
        });
  }

  ngOnInit() {
    // This code below is for a Tree Component attempt  AL
    // this.moduleAreasService.getFiles().then((data) => (this.files = data));
    this.loadModules();
    this.form.patchValue({ ct_area_id: this.data?.id_area });
    if (this.data?.id_area !== undefined){
      this.loadData(this.data?.id_area)
    }
  }

  loadData(id_area: number): void {
    this.moduleAreasService.getModules(id_area).subscribe({
      next: (data) => {
        // Asegúrate de que `data.moduleArea` es un array antes de intentar asignarlo
        if (Array.isArray(data.moduleArea)) {
          this.rowData = [...data.moduleArea];  // Solo asignamos si es un array
        } else {
          this.rowData = [];  // Si no es un array, asignamos un array vacío
        }

        if (this.rowData.length === 0) {
          console.log('No hay registros para mostrar.');
        }

        this.cdr.detectChanges();  // Forzar la actualización de la vista
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
        this.rowData = [];  // Vaciar los datos en caso de error
        this.cdr.detectChanges();  // Forzar la actualización de la vista en caso de error
      },
    });
  }

  loadModules(): void {
    this.moduleAreasService.getData().subscribe({
      next: (data) => {
        this.modules = [...data.modules];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  filterModule(event: AutoCompleteCompleteEvent) {
    let query = event.query.toLowerCase();

    // Filtrar los módulos que no están relacionados
    this.filteredModules = this.modules.filter(module => {
      // Thanks to Daniel /,,/
      const isRelated = this.rowData.some(relatedModule => relatedModule.ct_modulo_id === module.id_modulo);
      return (
        !isRelated && // Excluir módulos relacionados
        module.nombre_modulo.toLowerCase().includes(query) // Coincidir con la búsqueda
      );
    });
  }

  onModuleSelect(event: any) {
  // Guardar solo el ID del área en el formulario
  this.form.get('ct_modulo_id')?.setValue(event.value.id_modulo);
  this.form.get('ct_modulo')?.setValue(event.value.nombre_modulo);
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.ct_modulo.nombre_modulo}?`,
        'Eliminar registro',
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.moduleAreasService.delete(this.user.id_usuario, row.id_modulo_area).subscribe({
            next: () => {
              this.loadData(row.ct_area_id); // Recargar los datos después de eliminar
              this.form.reset(); // Resetear el formulario
              this.form.patchValue({ ct_area_id: this.data?.id_area }); // Reaplicar el ID del área

              // Asegurarse de que los cambios se reflejen en la vista
              this.cdr.markForCheck(); // Forzar la detección de cambios
            },
            error: (error) => {
              this.alertService.error('No se pudo eliminar el registro.');
            },
          });
        }
      });
  }

  onSubmit(){
    if (this.form.valid) {
      if (this.data?.mode === 'add') {
        this.moduleAreasService.add(this.form.value).subscribe(
          {
            next: () => {
              this.loadData(this.data?.id_area!); // Recargar los datos
              this.form.reset(); // Resetear el formulario
              this.form.patchValue({ ct_area_id: this.data?.id_area }); // Reaplicar el ID del área
            },
            error: (error) => {
              console.error('Error al agregar el módulo:', error);
            },
          });
        //this.data?.loadData?.();
      } else if (this.data?.mode === 'edit' && this.data.id_area) {
        this.moduleAreasService.edit(this.data.id_area, this.form.value).subscribe({
          next: () => {
            this.loadData(this.data?.id_area!); // Recargar los datos
            this.form.reset(); // Resetear el formulario
            this.form.patchValue({ ct_area_id: this.data?.id_area }); // Reaplicar el ID del área
          },
          error: (error) => {
            console.error('Error al editar el módulo:', error);
          },
        });
        //this.data?.loadData?.();
      }
    }
  }

}
