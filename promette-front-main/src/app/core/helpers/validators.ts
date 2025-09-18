import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const ValidatorsPatterns = {
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
  curp: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/,
  rfc: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  telefono: /^[0-9]{10}$/,
  codigoPostal: /^[0-9]{5}$/,
  calle: /^[a-zA-Z0-9\s#.,-]{2,100}$/,
  numero: /^[0-9]{1,5}$/,
  colonia: /^[a-zA-Z0-9\s]{2,100}$/,
  estado: /^[a-zA-Z\s]{2,50}$/,
  apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,50}$/,
  seguroSocial: /^[0-9]{11}$/,
};

export function validateMultipleFields(
  controlName: string,
  comparisonControlNames: string[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.parent) return null; // Si el control no tiene un formulario padre, no hacemos nada

    const formGroup = control.parent;
    const currentValue = control.value;

    // Si el campo está vacío, no hacemos ninguna validación (solo los campos no vacíos se comparan)
    if (!currentValue) return null;

    // Obtener los valores de los campos a comparar
    const comparisonValues = comparisonControlNames.map(
      (name) => formGroup.get(name)?.value
    );

    // Verificar si el valor actual es igual a alguno de los otros valores
    if (
      comparisonValues.some((value) => value === currentValue && value !== '')
    ) {
      return { valorEnUso: true };
    }

    return null; // Si no hay error, retornamos null
  };
}
