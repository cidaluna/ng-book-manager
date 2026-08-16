import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { BooksState } from '../../state/books.state';
import { PublishersState } from '../../../publishers/state/publishers.state';
import { LoadBooks, DeleteBook } from '../../state/books.actions';
import { LoadPublishers } from '../../../publishers/state/publishers.actions';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList {
  private store = inject(Store);

  /**
   * Combina livros com editoras para exibir o nome da editora na tabela
   * sem precisar de um campo desnormalizado no backend. Uso de RxJS
   * combineLatest + map é o padrão certo pra "juntar" dois streams de state.
   */
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

  constructor() {
    this.store.dispatch([new LoadBooks(), new LoadPublishers()]);
  }

  /** Remove o livro selecionado. Livro não tem dependentes, então a exclusão é direta. */
  remove(id: string): void {
    this.store.dispatch(new DeleteBook(id));
  }
}
