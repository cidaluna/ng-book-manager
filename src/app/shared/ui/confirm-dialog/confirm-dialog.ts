import { Component, input, output } from '@angular/core';

/**
 * Dialog de confirmação genérico e "burro" (dumb component): não conhece
 * regra de negócio nenhuma, apenas emite eventos. Reutilizável em qualquer
 * feature que precise de confirmação antes de uma ação destrutiva.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  title = input.required<string>();
  message = input.required<string>();

  confirm = output<void>();
  cancel = output<void>();
}
