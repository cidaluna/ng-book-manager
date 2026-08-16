import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { LoaderState } from '../../../core/state/loader/loader.state';

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
  isLoading$ = this.store.select(LoaderState.isLoading);
}
