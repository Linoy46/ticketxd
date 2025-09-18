import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MayusculasDirective } from '../../../core/directives/mayusculas/mayusculas.directive';
import { FormDataApplicantPatient } from '../../aneec/interfaces/applicantInterface/PersonaInscrita.Interface';
import { LocationsService } from '../services/locations.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { DiagnosisService } from '../services/diagnosis.service';

@Component({
  selector: 'app-patient-diagnosis',
  imports: [CommonModule, FormsModule, NgbNavModule],
  templateUrl: './patient-diagnosis.component.html',
  styleUrl: './patient-diagnosis.component.scss',
})
export class PatientDiagnosisComponent implements OnInit {
  @Input() data: any | null = null;

  isCURPDisabled: boolean = false; // Variable para controlar si el campo CURP está deshabilitado
  formData: FormDataApplicantPatient = {
    // Datos del formulario
    curp: '',
    nombreCompleto: '',
    municipio: '',
    rehabilitacion_fisica: '',
    tipo_necesidad: '',
    dt_aspirante_id: '',
    diagnostico: null,
  };

  activeTab = 'datos';
  municipios: any[] = [];
  isMultiple: boolean = false;

  constructor(
    private locationsService: LocationsService,
    private alertService: CoreAlertService,
    private diagnosisService: DiagnosisService
  ) {}

  ngOnInit(): void {
    const {
      data: { id_aspirante },
    } = this.data;
    this.formData.dt_aspirante_id = id_aspirante;
    this.getMunicipalities();
  }
  //Obtener municipios
  getMunicipalities(): any {
    this.locationsService.getMunicipalities().subscribe({
      next: (data: any) => {
        if (data && data.success && Array.isArray(data.municipios)) {
          this.municipios = data.municipios;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }
 /* onSubmit() {
    const hasEmptyFields = Object.values(this.formData).some((value) => {
      return (
        value === '' ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      );
    });

    if (hasEmptyFields) {
      this.alertService.error('Llena todos los campos por favor');
      return;
    }

    const form = new FormData();

    form.append('nombreCompleto', this.formData.nombreCompleto);
    form.append('curp', this.formData.curp);
    form.append('tipo_necesidad', this.formData.tipo_necesidad);
    form.append('rehabilitacion_fisica', this.formData.rehabilitacion_fisica);
    form.append('ct_municipio_id', this.formData.municipio);
    form.append('dt_aspirante_id', this.formData.dt_aspirante_id);

    if (this.formData.diagnostico instanceof File) {
      form.append('diagnostico', this.formData.diagnostico);
    }

   this.diagnosisService.registrarDiagnostico(form).subscribe({
      next: (response) => {
        this.alertService.success('Diagnóstico registrado exitosamente');
        console.log(response);
      },
      error: (err) => {
        this.alertService.error('Error al registrar diagnóstico');
        console.error(err);
      },
    });
  }*/

 /* onNecesidadChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.value == 'Multiple') {
      this.isMultiple = true;
    }
    if (input.checked) {
      this.formData.tipo_necesidad = input.value;
    } else {
      this.formData.tipo_necesidad = '';
    }
  }*/
/*  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.formData.diagnostico = file;
    } else {
      alert('Solo se permiten archivos PDF');
    }
  }*/
}
