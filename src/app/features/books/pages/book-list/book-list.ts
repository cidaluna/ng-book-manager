import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BooksState } from '../../state/books.state';
import { PublishersState } from '../../../publishers/state/publishers.state';
import { LoadBooks, DeleteBook, DeleteBookFail } from '../../state/books.actions';
import { LoadPublishers } from '../../../publishers/state/publishers.actions';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList {
  private store = inject(Store);
  private actions$ = inject(Actions);

  booksWithPublisher$ = combineLatest([
    this.store.select(BooksState.items),
    this.store.select(PublishersState.items),
  ]).pipe(
    map(([books, publishers]) =>
      books.map(book => ({
        ...book,
        publisherName: publishers.find(p => p.id === book.publisherId)?.name ?? '—',
      }))
    )
  );

  /**
   * O quê: mensagem de erro específica da operação de exclusão nesta tela.
   * Por quê aqui e não em nível global: exclusão de livro é uma ação sem
   * navegação — o usuário continua na lista. Um erro nesse fluxo faz mais
   * sentido como mensagem contextual na própria tela do que como toast
   * global, porque o usuário já está olhando exatamente pro item que falhou.
   */
  deleteErrorMessage = signal<string | null>(null);

  constructor() {
    this.store.dispatch([new LoadBooks(), new LoadPublishers()]);

    this.actions$
      .pipe(ofActionSuccessful(DeleteBookFail), takeUntilDestroyed())
      .subscribe(action => this.deleteErrorMessage.set(action.message));
  }

  remove(id: string): void {
    this.deleteErrorMessage.set(null);
    this.store.dispatch(new DeleteBook(id));
  }
}
