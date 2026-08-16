import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { PublishersApiService } from '../services/publishers-api.service';
import { Publisher } from '../models/publisher.model';
import {
  LoadPublishers, LoadPublishersSuccess, LoadPublishersFail,
  AddPublisher, AddPublisherSuccess, AddPublisherFail,
  UpdatePublisher, UpdatePublisherSuccess, UpdatePublisherFail,
  DeletePublisher, DeletePublisherSuccess, DeletePublisherFail,
  SelectPublisher,
} from './publishers.actions';

export interface PublishersStateModel {
  items: Publisher[];
  selectedId: string | null;
}

@State<PublishersStateModel>({
  name: 'publishers',
  defaults: { items: [], selectedId: null },
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
    return this.api.getAll().pipe(
      tap(items => {
        ctx.patchState({ items });
        ctx.dispatch(new LoadPublishersSuccess(items));
      }),
      catchError(err => {
        ctx.dispatch(new LoadPublishersFail(err?.message ?? 'Erro desconhecido ao carregar editoras'));
        return EMPTY;
      })
    );
  }

  @Action(AddPublisher)
  add(ctx: StateContext<PublishersStateModel>, action: AddPublisher) {
    return this.api.create(action.payload).pipe(
      tap(created => {
        const state = ctx.getState();
        ctx.patchState({ items: [...state.items, created] });
        ctx.dispatch(new AddPublisherSuccess(created));
      }),
      catchError(err => {
        ctx.dispatch(new AddPublisherFail(err?.message ?? 'Erro desconhecido ao criar editora'));
        return EMPTY;
      })
    );
  }

  @Action(UpdatePublisher)
  update(ctx: StateContext<PublishersStateModel>, action: UpdatePublisher) {
    return this.api.update(action.id, action.changes).pipe(
      tap(updated => {
        const state = ctx.getState();
        ctx.patchState({
          items: state.items.map(p => (p.id === updated.id ? updated : p)),
        });
        ctx.dispatch(new UpdatePublisherSuccess(updated));
      }),
      catchError(err => {
        ctx.dispatch(new UpdatePublisherFail(err?.message ?? 'Erro desconhecido ao atualizar editora'));
        return EMPTY;
      })
    );
  }

  @Action(DeletePublisher)
  delete(ctx: StateContext<PublishersStateModel>, action: DeletePublisher) {
    return this.api.remove(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ items: state.items.filter(p => p.id !== action.id) });
        ctx.dispatch(new DeletePublisherSuccess(action.id));
      }),
      catchError(err => {
        ctx.dispatch(new DeletePublisherFail(err?.message ?? 'Erro desconhecido ao remover editora'));
        return EMPTY;
      })
    );
  }

  @Action(SelectPublisher)
  select(ctx: StateContext<PublishersStateModel>, action: SelectPublisher) {
    ctx.patchState({ selectedId: action.id });
  }
}
