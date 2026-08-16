import { Routes } from '@angular/router';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/book-list/book-list').then(m => m.BookList),
  },
  {
    path: 'novo',
    loadComponent: () => import('./pages/book-form/book-form').then(m => m.BookForm),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/book-form/book-form').then(m => m.BookForm),
  },
];
