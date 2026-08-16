import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BooksState } from '../../state/books.state';
import { AddBook, AddBookFail, AddBookSuccess, UpdateBook, UpdateBookFail, UpdateBookSuccess } from '../../state/books.actions';
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
  private actions$ = inject(Actions);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  publishers$ = this.store.select(PublishersState.items);
  private editingId: string | null = null;

  /**
   * O quê: sinal local, só deste componente — não vai pro NGXS.
   * Por quê: essa mensagem de erro é estado de UI transiente e específico
   * desta tela (some ao trocar de rota, não precisa ser rastreado
   * globalmente). Colocar isso no NGXS seria over-engineering: nem todo
   * estado precisa passar pela store, só o que é compartilhado entre
   * componentes ou precisa sobreviver à destruição do componente.
   */
  errorMessage = signal<string | null>(null);


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
        const publisher = this.store.selectSnapshot(PublishersState.items).find(p => p.id === id);
        return publisher?.foundedYear;
      }),
    }
  );

  constructor() {
    /**
     * O quê: escuta as actions de sucesso do BooksState via Actions stream,
     * em vez de confiar no callback de store.dispatch(...).subscribe(...).
     * Por quê: dispatch() SEMPRE completa (o catchError + EMPTY garante
     * isso), então o callback de sucesso do dispatch por si só NÃO diz nada
     * sobre se a operação realmente funcionou. Escutar AddBookSuccess/
     * UpdateBookSuccess especificamente é a única forma confiável de saber
     * que o POST/PATCH de fato teve sucesso no servidor.
     * Como isso ajuda no PR: um revisor lendo este bloco entende
     * imediatamente a intenção — "só navega quando a operação realmente
     * deu certo" — sem precisar rastrear o pipe inteiro do state.
     */
    this.actions$
      .pipe(ofActionSuccessful(AddBookSuccess, UpdateBookSuccess), takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/books']));

    /**
     * Por quê usar takeUntilDestroyed(): sem isso, essa subscription
     * viveria além do tempo de vida do componente — se o usuário sair da
     * tela antes da API responder, o callback ainda dispararia (memory
     * leak clássico de RxJS + Angular). takeUntilDestroyed() usa o
     * DestroyRef do componente automaticamente, sem precisar implementar
     * OnDestroy manualmente. É o padrão moderno recomendado desde o
     * Angular 16 para esse tipo de subscription "ligada ao componente".
     */
    this.actions$
      .pipe(ofActionSuccessful(AddBookFail, UpdateBookFail), takeUntilDestroyed())
      .subscribe(action => this.errorMessage.set(action.message));
  }

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

    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    const action = this.editingId
      ? new UpdateBook(this.editingId, value)
      : new AddBook(value);

    this.store.dispatch(action);
  }
}
