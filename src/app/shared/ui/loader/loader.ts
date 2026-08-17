import { Component, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { LoaderState } from '../../../core/state/loader/loader.state';
import { tap } from 'rxjs';

/**
 * Consome o LoaderState.isLoading globalmente — fica no shell da aplicação
 * (app.component.html), não em cada página, então não precisa ser
 * reimplementado por feature.
 */
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  private store = inject(Store);
  // O cifrão no final avisa que não é um valor único, ele é um Observable que representa um fluxo contínuo de dados do RxJS.
  // Toda vez que o contador de requisição HTTP no State muda, o Selector recalcula e devolve aqui o novo status (true/false), atualizando a tela sem travar ou piscar.
  // isLoading$ = this.store.select(LoaderState.isLoading); // essa linha resolve, apenas usei os consoles abaixo para facilitar os estudos.

  isLoading$ = this.store.select(LoaderState.isLoading).pipe(
    tap(status => {
      if (isDevMode()) {
        console.log(`%c[NGXS - Loader Status] Tela mudou? → ${status}`, 'color: #ff9800; font-weight: bold;');
      }
    })
  );
}
