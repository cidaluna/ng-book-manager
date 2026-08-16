import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model';

export class LoadBooks {
  static readonly type = '[Books] Load Books';
}

/**
 * Por quê: em vez de guardar um campo genérico "error" no state (que fica
 * ambíguo sobre qual operação falhou e pode ser sobrescrito por outra
 * operação concorrente), cada resultado assíncrono vira uma action própria.
 * Isso transforma o "resultado da operação" em um evento rastreável e
 * discreto — dá pra ver no Redux DevTools exatamente o que aconteceu, na
 * ordem em que aconteceu, sem depender de inspecionar um snapshot de state
 * que pode já ter mudado.
 */
export class LoadBooksSuccess {
  static readonly type = '[Books] Load Books Success';
  constructor(public items: Book[]) {}
}

export class LoadBooksFail {
  static readonly type = '[Books] Load Books Fail';
  constructor(public message: string) {}
}

export class AddBook {
  static readonly type = '[Books] Add Book';
  constructor(public payload: CreateBookDto) {}
}

export class AddBookSuccess {
  static readonly type = '[Books] Add Book Success';
  constructor(public book: Book) {}
}

export class AddBookFail {
  static readonly type = '[Books] Add Book Fail';
  constructor(public message: string) {}
}

export class UpdateBook {
  static readonly type = '[Books] Update Book';
  constructor(public id: string, public changes: UpdateBookDto) {}
}

export class UpdateBookSuccess {
  static readonly type = '[Books] Update Book Success';
  constructor(public book: Book) {}
}

export class UpdateBookFail {
  static readonly type = '[Books] Update Book Fail';
  constructor(public message: string) {}
}

export class DeleteBook {
  static readonly type = '[Books] Delete Book';
  constructor(public id: string) {}
}

export class DeleteBookSuccess {
  static readonly type = '[Books] Delete Book Success';
  constructor(public id: string) {}
}

export class DeleteBookFail {
  static readonly type = '[Books] Delete Book Fail';
  constructor(public message: string) {}
}

/** Sem Success/Fail — é síncrona, não toca a API, não pode falhar. */
export class SelectBook {
  static readonly type = '[Books] Select Book';
  constructor(public id: string | null) {}
}
