import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { PublishersState } from '../../state/publishers.state';
import { BooksState } from '../../../books/state/books.state';
import { LoadPublishers, DeletePublisher, DeletePublisherFail } from '../../state/publishers.actions';
import { LoadBooks } from '../../../books/state/books.actions';
import { Publisher } from '../../models/publisher.model';
import { ConfirmDialog } from './../../../../shared/ui/confirm-dialog/confirm-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-publisher-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialog],
  templateUrl: './publisher-list.html',
  styleUrl: './publisher-list.scss',
})
export class PublisherList {
  private store = inject(Store);
  private actions$ = inject(Actions);

  publishers$ = this.store.select(PublishersState.items);

  publisherPendingDeletion: Publisher | null = null;

  /**
   * Por quê dois sinais de erro separados (blockedDeletionMessage vs.
   * apiErrorMessage): são causas completamente diferentes. Um é validação
   * de regra de negócio no front (síncrona, nunca chega a tocar a API); o
   * outro é falha real do servidor (assíncrona, via DeletePublisherFail).
   * Misturar os dois num campo único perderia essa distinção, que é
   * justamente o que ajuda a debugar rápido: "isso é uma regra de UI
   * bloqueando, ou o servidor recusou?"
   */
  blockedDeletionMessage: string | null = null;
  apiErrorMessage = signal<string | null>(null);

  constructor() {
    this.store.dispatch([new LoadPublishers(), new LoadBooks()]);

    this.actions$
      .pipe(ofActionSuccessful(DeletePublisherFail), takeUntilDestroyed())
      .subscribe(action => this.apiErrorMessage.set(action.message));
  }

  requestDelete(publisher: Publisher): void {
    const fn = this.store.selectSnapshot(BooksState.booksByPublisher);
    const linkedBooks = fn(publisher.id);

    if (linkedBooks.length > 0) {
      this.blockedDeletionMessage = `Não é possível remover "${publisher.name}": há ${linkedBooks.length} livro(s) vinculado(s).`;
      return;
    }

    this.blockedDeletionMessage = null;
    this.apiErrorMessage.set(null);
    this.publisherPendingDeletion = publisher;
  }

  confirmDelete(): void {
    if (!this.publisherPendingDeletion) return;
    this.store.dispatch(new DeletePublisher(this.publisherPendingDeletion.id));
    this.publisherPendingDeletion = null;
  }

  cancelDelete(): void {
    this.publisherPendingDeletion = null;
  }
}
