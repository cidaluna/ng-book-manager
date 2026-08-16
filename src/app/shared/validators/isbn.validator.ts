import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida formato ISBN-10 ou ISBN-13 (com ou sem hífens).
 * Regra de negócio: todo livro cadastrado precisa ter um ISBN reconhecível,
 * pois é o identificador usado em integrações externas (não implementadas aqui,
 * mas o dado precisa nascer consistente).
 */
export function isbnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').replace(/-/g, '');
    if (!value) return null; // deixa o Validators.required cuidar do campo vazio

    const isIsbn10 = /^\d{9}[\dX]$/.test(value);
    const isIsbn13 = /^\d{13}$/.test(value);

    return isIsbn10 || isIsbn13 ? null : { invalidIsbn: true };
  };
}
