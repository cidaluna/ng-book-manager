import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BooksState } from '../../state/books.state';
import { AddBook, UpdateBook } from '../../state/books.actions';
import { PublishersState } from '../../../publishers/state/publishers.state';
import { isbnValidator } from '../../../../shared/validators/isbn.validator';
import { publicationYearValidator } from '../../../../shared/validators/publication-year.validator';

@Component({
  selector: 'app-book-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  publishers$ = this.store.select(PublishersState.items);
  private editingId: string | null = null;


  form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required, isbnValidator()]],
      publisherId: ['', Validators.required],
      publishedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1400)]],
      pages: [0, [Validators.required, Validators.min(1)]],
      available: [true],
    },
    {
      validators: publicationYearValidator(id => {
        const publisher = this.store
          .selectSnapshot(PublishersState.items)
          .find(p => p.id === id);
        return publisher?.foundedYear;
      }),
    }
  );

  /** Ao iniciar, verifica se há um :id na rota — se sim, entra em modo edição. */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editingId = id;
    const book = this.store.selectSnapshot(BooksState.items).find(b => b.id === id);
    if (book) {
      this.form.patchValue(book);
    }
  }

  /** Envia o formulário: despacha Add ou Update conforme o modo, e navega de volta à listagem. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const action = this.editingId
      ? new UpdateBook(this.editingId, value)
      : new AddBook(value);

    this.store.dispatch(action).subscribe(() => this.router.navigate(['/books']));
  }
}
