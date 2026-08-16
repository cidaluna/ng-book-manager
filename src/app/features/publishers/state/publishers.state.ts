import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PublishersApiService } from '../services/publishers-api.service';
import { Publisher } from '../models/publisher.model';
import {
  LoadPublishers, AddPublisher, UpdatePublisher, DeletePublisher, SelectPublisher
} from './publishers.actions';
import { StartLoading, StopLoading } from './../../../core/state/loader/loader.actions';

export interface PublishersStateModel {
  items: Publisher[];
  selectedId: string | null;
  error: string | null;
}

@State<PublishersStateModel>({
  name: 'publishers',
  defaults: {
    items: [],
    selectedId: null,
    error: null,
  },
})
@Injectable()
export class PublishersState {
  private api = inject(PublishersApiService);

  @Selector()
  static items(state: PublishersStateModel): Publisher[] {
    return state.items;
  }

  @Selector()
  static selected(state: PublishersStateModel): Publisher | null {
    return state.items.find(p => p.id === state.selectedId) ?? null;
  }

  @Selector()
  static count(state: PublishersStateModel): number {
    return state.items.length;
  }

  @Action(LoadPublishers)
  load(ctx: StateContext<PublishersStateModel>) {
    ctx.dispatch(new StartLoading());
    return this.api.getAll().pipe(
      tap(items => ctx.patchState({ items, error: null })),
      catchError(err => {
        ctx.patchState({ error: 'Falha ao carregar editoras' });
        return of(null);
      }),
      // finalize garante StopLoading mesmo em erro — ponto de RxJS que vale destacar
      tap({ complete: () => ctx.dispatch(new StopLoading()) })
    );
  }

  @Action(AddPublisher)
  add(ctx: StateContext<PublishersStateModel>, action: AddPublisher) {
    ctx.dispatch(new StartLoading());
    return this.api.create(action.payload).pipe(
      tap(created => {
        const state = ctx.getState();
        ctx.patchState({ items: [...state.items, created] });
      }),
      catchError(err => {
        ctx.patchState({ error: 'Falha ao criar editora' });
        return of(null);
      }),
      tap({ complete: () => ctx.dispatch(new StopLoading()) })
    );
  }

  @Action(UpdatePublisher)
  update(ctx: StateContext<PublishersStateModel>, action: UpdatePublisher) {
    ctx.dispatch(new StartLoading());
    return this.api.update(action.id, action.changes).pipe(
      tap(updated => {
        const state = ctx.getState();
        ctx.patchState({
          items: state.items.map(p => (p.id === updated.id ? updated : p)),
        });
      }),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao atualizar editora' });
        return of(null);
      }),
      tap({ complete: () => ctx.dispatch(new StopLoading()) })
    );
  }

  @Action(DeletePublisher)
  delete(ctx: StateContext<PublishersStateModel>, action: DeletePublisher) {
    ctx.dispatch(new StartLoading());
    return this.api.remove(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ items: state.items.filter(p => p.id !== action.id) });
      }),
      catchError(() => {
        ctx.patchState({ error: 'Falha ao remover editora (verifique se há livros vinculados)' });
        return of(null);
      }),
      tap({ complete: () => ctx.dispatch(new StopLoading()) })
    );
  }

  @Action(SelectPublisher)
  select(ctx: StateContext<PublishersStateModel>, action: SelectPublisher) {
    ctx.patchState({ selectedId: action.id });
  }
}
