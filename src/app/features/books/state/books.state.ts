import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { BooksApiService } from '../services/books-api.service';
import { Book } from '../models/book.model';
import {
  LoadBooks, LoadBooksSuccess, LoadBooksFail,
  AddBook, AddBookSuccess, AddBookFail,
  UpdateBook, UpdateBookSuccess, UpdateBookFail,
  DeleteBook, DeleteBookSuccess, DeleteBookFail,
  SelectBook,
} from './books.actions';

/**
 * Por quê: removemos o campo "error: string | null" que existia antes.
 * Erro é dado transiente de UI (deveria "desaparecer" depois de exibido),
 * não dado de domínio persistente como a lista de livros. Guardá-lo aqui
 * significava que uma operação de sucesso podia apagar silenciosamente o
 * erro de uma operação anterior que o usuário ainda não tinha visto.
 * Agora o erro vive só como payload de uma action (Fail), consumido uma
 * única vez por quem está ouvindo — sem persistir em lugar nenhum.
 */
export interface BooksStateModel {
  items: Book[];
  selectedId: string | null;
}

@State<BooksStateModel>({
  name: 'books',
  defaults: { items: [], selectedId: null },
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

  @Selector()
  static booksByPublisher(state: BooksStateModel): (publisherId: string) => Book[] {
    return (publisherId: string) => state.items.filter(b => b.publisherId === publisherId);
  }

  /**
   * O quê: carrega a lista de livros da API.
   * Por quê o pipe termina sempre em catchError + EMPTY: se a requisição
   * falhar e o Observable desse handler "explodir" com erro, o NGXS nunca
   * marca a action como concluída — qualquer componente esperando
   * store.dispatch(...).subscribe(...) trava, e o loader global (que
   * depende do finalize() no interceptor) também nunca desliga. EMPTY
   * resolve isso: sinaliza "terminei, sem valor útil", permitindo que o
   * fluxo de dispatch complete normalmente mesmo em caso de erro.
   * Como isso ajuda no PR: qualquer revisor que veja "return EMPTY;" dentro
   * de um catchError sabe imediatamente que esse handler é resiliente a
   * falha de rede sem precisar ler a implementação inteira.
   */
  @Action(LoadBooks)
  load(ctx: StateContext<BooksStateModel>) {
    return this.api.getAll().pipe(
      tap(items => {
        ctx.patchState({ items });
        // Dispara o "evento de sucesso" só depois que o state já está
        // atualizado — quem escuta LoadBooksSuccess pode confiar que os
        // dados já estão disponíveis via selector nesse exato momento.
        ctx.dispatch(new LoadBooksSuccess(items));
      }),
      catchError(err => {
        ctx.dispatch(new LoadBooksFail(err?.message ?? 'Erro desconhecido ao carregar livros'));
        return EMPTY;
      })
    );
  }

  /**
   * O quê: cria um livro novo.
   * Por quê separar AddBookSuccess/AddBookFail do AddBook: o componente que
   * disparou AddBook não precisa (e não deveria) saber o payload de sucesso
   * pelo callback de .subscribe() — ele escuta a action específica via
   * Actions stream (veja book-form.component.ts). Isso desacopla "quem
   * dispara a operação" de "quem reage ao resultado", permitindo que
   * MÚLTIPLOS componentes reajam ao mesmo evento sem duplicar lógica
   * (ex: um toast global de sucesso + a navegação do form, ao mesmo tempo,
   * sem um depender do outro).
   */
  @Action(AddBook)
  add(ctx: StateContext<BooksStateModel>, action: AddBook) {
    return this.api.create(action.payload).pipe(
      tap(created => {
        const state = ctx.getState();
        ctx.patchState({ items: [...state.items, created] });
        ctx.dispatch(new AddBookSuccess(created));
      }),
      catchError(err => {
        ctx.dispatch(new AddBookFail(err?.message ?? 'Erro desconhecido ao criar livro'));
        return EMPTY;
      })
    );
  }

  @Action(UpdateBook)
  update(ctx: StateContext<BooksStateModel>, action: UpdateBook) {
    return this.api.update(action.id, action.changes).pipe(
      tap(updated => {
        const state = ctx.getState();
        ctx.patchState({
          items: state.items.map(b => (b.id === updated.id ? updated : b)),
        });
        ctx.dispatch(new UpdateBookSuccess(updated));
      }),
      catchError(err => {
        ctx.dispatch(new UpdateBookFail(err?.message ?? 'Erro desconhecido ao atualizar livro'));
        return EMPTY;
      })
    );
  }

  /**
   * Por quê guardamos "action.id" (não o objeto Book inteiro) no Success:
   * depois de deletado, o objeto já não existe mais no state — não faz
   * sentido devolver algo que acabou de ser removido. O id é suficiente
   * pra qualquer componente que precise saber "qual item sumiu" (ex: fechar
   * um modal de detalhe se ele estava aberto pra esse id específico).
   */
  @Action(DeleteBook)
  delete(ctx: StateContext<BooksStateModel>, action: DeleteBook) {
    return this.api.remove(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ items: state.items.filter(b => b.id !== action.id) });
        ctx.dispatch(new DeleteBookSuccess(action.id));
      }),
      catchError(err => {
        ctx.dispatch(new DeleteBookFail(err?.message ?? 'Erro desconhecido ao remover livro'));
        return EMPTY;
      })
    );
  }

  @Action(SelectBook)
  select(ctx: StateContext<BooksStateModel>, action: SelectBook) {
    ctx.patchState({ selectedId: action.id });
  }
}
