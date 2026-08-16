import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { StartLoading, StopLoading } from '../state/loader/loader.actions';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  store.dispatch(new StartLoading());

  return next(req).pipe(
    // finalize roda em sucesso E erro — é o operador certo pra "desligar" algo, nunca use apenas tap
    finalize(() => store.dispatch(new StopLoading()))
  );
};
