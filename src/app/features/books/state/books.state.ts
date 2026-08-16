import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { BooksApiService } from '../services/books-api.service';
import { Book } from '../models/book.model';
import { LoadBooks, AddBook, UpdateBook, DeleteBook, SelectBook } from './books.actions';
import { StartLoading, StopLoading } from '../../../core/state/loader/loader.actions';

export interface BooksStateModel {
  items: Book[];
  selectedId: string | null;
  error: string | null;
}

@State<BooksStateModel>({
  name: 'books',
  defaults: { items: [], selectedId: null, error: null },
})
@Injectable()
export class BooksState {
  private api = inject(BooksApiService);

  @Selector()
  static items(state: BooksStateModel): Book[] {
    return state.items;
  }

  @Selector()
  static selected(state: BooksStateModel): Book | null {
    return state.items.find(b => b.id === state.selectedId) ?? null;
  }

  /**
   * Selector parametrizado: retorna uma função que filtra livros por editora.
   * É a peça-chave da integração entre os dois domínios — permite que o
   * PublishersState (ou os componentes) verifiquem dependência sem acoplar services.
   */
  @Selector()
  static booksByPublisher(state: BooksStateModel): (publisherId: string) => Book[] {
    return (publisherId: string) => state.items.filter(b => b.publisherId === publisherId);
  }

  /** Carrega todos os livros e sincroniza o estado local com a resposta da API. */
  @Action(LoadBooks)
  load(ctx: StateContext<BooksStateModel>) {
    ctx.dispatch(new StartLoading());
    return this.api.getAll().pipe(
      tap(items => ctx.patchState({ items, error: null })),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao carregar livros' });
        return of(null);
      }),
      finalize(() => ctx.dispatch(new StopLoading()))
    );
  }

  /** Cria um livro e o adiciona ao final da lista local (evita novo GET completo). */
  @Action(AddBook)
  add(ctx: StateContext<BooksStateModel>, action: AddBook) {
    ctx.dispatch(new StartLoading());
    return this.api.create(action.payload).pipe(
      tap(created => {
        const state = ctx.getState();
        ctx.patchState({ items: [...state.items, created] });
      }),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao criar livro' });
        return of(null);
      }),
      finalize(() => ctx.dispatch(new StopLoading()))
    );
  }

  /** Atualiza um livro existente e reflete a mudança no array em memória. */
  @Action(UpdateBook)
  update(ctx: StateContext<BooksStateModel>, action: UpdateBook) {
    ctx.dispatch(new StartLoading());
    return this.api.update(action.id, action.changes).pipe(
      tap(updated => {
        const state = ctx.getState();
        ctx.patchState({
          items: state.items.map(b => (b.id === updated.id ? updated : b)),
        });
      }),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao atualizar livro' });
        return of(null);
      }),
      finalize(() => ctx.dispatch(new StopLoading()))
    );
  }

  /** Remove um livro. Não há regra de bloqueio aqui — livro não tem dependentes. */
  @Action(DeleteBook)
  delete(ctx: StateContext<BooksStateModel>, action: DeleteBook) {
    ctx.dispatch(new StartLoading());
    return this.api.remove(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ items: state.items.filter(b => b.id !== action.id) });
      }),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao remover livro' });
        return of(null);
      }),
      finalize(() => ctx.dispatch(new StopLoading()))
    );
  }

  /** Define o livro atualmente selecionado (usado ao abrir o formulário em modo edição). */
  @Action(SelectBook)
  select(ctx: StateContext<BooksStateModel>, action: SelectBook) {
    ctx.patchState({ selectedId: action.id });
  }
}
