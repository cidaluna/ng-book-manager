import { Routes } from '@angular/router';

export const PUBLISHERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/publisher-list/publisher-list').then(m => m.PublisherList),
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./pages/publisher-form/publisher-form').then(m => m.PublisherForm),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/publisher-form/publisher-form').then(m => m.PublisherForm),
  },
];
