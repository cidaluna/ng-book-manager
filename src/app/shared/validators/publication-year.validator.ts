import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validação cross-field: o ano de publicação do livro não pode ser anterior
 * ao ano de fundação da editora selecionada. Regra de consistência de domínio
 * que só faz sentido no escopo do formulário, pois depende de dois campos.
 *
 * @param getFoundedYear função que resolve o foundedYear da editora selecionada
 *        no momento da validação (injetada pelo form, não hardcoded aqui —
 *        mantém o validator agnóstico de onde o dado vem, princípio de
 *        inversão de dependência).
 */
export function publicationYearValidator(
  getFoundedYear: (publisherId: string) => number | undefined
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const publisherId = control.get('publisherId')?.value;
    const publishedYear = control.get('publishedYear')?.value;
    if (!publisherId || !publishedYear) return null;

    const foundedYear = getFoundedYear(publisherId);
    if (foundedYear == null) return null;

    return publishedYear < foundedYear
      ? { yearBeforeFoundation: { foundedYear } }
      : null;
  };
}
