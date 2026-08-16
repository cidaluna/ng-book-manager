import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { PublishersState } from '../../state/publishers.state';
import { BooksState } from '../../../books/state/books.state';
import { LoadPublishers, DeletePublisher } from '../../state/publishers.actions';
import { LoadBooks } from '../../../books/state/books.actions';
import { Publisher } from '../../models/publisher.model';
import { ConfirmDialog } from './../../../../shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-publisher-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialog],
  templateUrl: './publisher-list.html',
  styleUrl: './publisher-list.scss',
})
export class PublisherList {
  private store = inject(Store);

  publishers$ = this.store.select(PublishersState.items);
  private booksByPublisher$ = this.store.select(BooksState.booksByPublisher);

  publisherPendingDeletion: Publisher | null = null;
  blockedDeletionMessage: string | null = null;

  constructor() {
    // Carrega os dois domínios: livros é necessário aqui só para validar exclusão.
    this.store.dispatch([new LoadPublishers(), new LoadBooks()]);
  }

  /** Abre a confirmação de exclusão, mas antes verifica se a editora tem livros vinculados. */
  requestDelete(publisher: Publisher): void {
    const fn = this.store.selectSnapshot(BooksState.booksByPublisher);
    const linkedBooks = fn(publisher.id);

    if (linkedBooks.length > 0) {
      this.blockedDeletionMessage = `Não é possível remover "${publisher.name}": há ${linkedBooks.length} livro(s) vinculado(s).`;
      return;
    }

    this.blockedDeletionMessage = null;
    this.publisherPendingDeletion = publisher;
  }

  /** Confirmado pelo usuário no dialog, dispara a exclusão de fato. */
  confirmDelete(): void {
    if (!this.publisherPendingDeletion) return;
    this.store.dispatch(new DeletePublisher(this.publisherPendingDeletion.id));
    this.publisherPendingDeletion = null;
  }

  cancelDelete(): void {
    this.publisherPendingDeletion = null;
  }
}
