import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { StartLoading, StopLoading } from './loader.actions';

export interface LoaderStateModel {
  requestCount: number; // contador, não boolean — evita loader "piscar" com requests concorrentes
}

@State<LoaderStateModel>({
  name: 'loader',
  defaults: { requestCount: 0 },
})
@Injectable()
export class LoaderState {
  @Selector()
  static isLoading(state: LoaderStateModel): boolean {
    return state.requestCount > 0;
  }

  @Action(StartLoading)
  start(ctx: StateContext<LoaderStateModel>) {
    const state = ctx.getState();
    console.log('[LoaderState] +1 →', state.requestCount + 1);
    ctx.patchState({ requestCount: state.requestCount + 1 });
  }

  @Action(StopLoading)
  stop(ctx: StateContext<LoaderStateModel>) {
    const state = ctx.getState();
    ctx.patchState({ requestCount: Math.max(0, state.requestCount - 1) });
  }
}
