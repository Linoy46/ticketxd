import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancingItem } from '../interfaces/financing.interface';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import { InputTextModule } from 'primeng/inputtext';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';

@Component({
  selector: 'app-financing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  @Input() data: any;
  financingForm!: FormGroup;
  isEditMode = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private modalService: CoreModalService,
    private loadingService: CoreLoadingService // Inyectar el servicio de loading compartido
  ) {}

  ngOnInit(): void {
    this.initForm();
    console.log('Form initialized with data:', this.data);

    // Suscribirse al estado de loading
    this.loadingService.loading$.subscribe(isLoading => {
      this.loading = isLoading;
    });
  }

  initForm(): void {
    const item = this.data?.item || {};
    console.log('Item data for form:', item);

    this.isEditMode = !!item.id_financiamiento;

    const isActive = item.estado === undefined ? true : item.estado === 1;

    console.log('Estado:', item.estado, 'isActive:', isActive);

    this.financingForm = this.fb.group({
      id_financiamiento: [item.id_financiamiento],
      nombre_financiamiento: [item.nombre_financiamiento || '', Validators.required],
      estadoSwitch: [isActive],
    });
    console.log('Form initialized with data:', {
      mode: this.isEditMode ? 'edit' : 'create',
      itemData: item,
      formValue: this.financingForm.value
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.financingForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submitForm(): void {
    if (this.financingForm.valid) {
      this.loadingService.show(); // Mostrar loading al enviar el formulario

      // Asegúrate de que el objeto tenga todos los campos necesarios
      const formValue = {
        ...this.financingForm.value,
        estado: this.financingForm.get('estadoSwitch')?.value ? 1 : 0
      };

      // Remove estadoSwitch as it's not needed for the backend
      delete formValue.estadoSwitch;

      console.log('Submitting form with values:', formValue); // Log para debugging
      this.data.onSave(formValue);
      this.close();
    } else {
      // Mark all form controls as touched to display validation errors
      Object.keys(this.financingForm.controls).forEach(key => {
        this.financingForm.get(key)?.markAsTouched();
      });
    }
  }

  close(): void {
    this.modalService.close();
  }
}
