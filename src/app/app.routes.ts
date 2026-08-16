import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', loadChildren: () => import('./features/books/books.routes').then(m => m.BOOKS_ROUTES) },
  { path: 'publishers', loadChildren: () => import('./features/publishers/publishers.routes').then(m => m.PUBLISHERS_ROUTES) },
];
