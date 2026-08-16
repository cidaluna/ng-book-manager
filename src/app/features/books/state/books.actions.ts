import { CreateBookDto, UpdateBookDto } from '../models/book.model';

export class LoadBooks {
  static readonly type = '[Books] Load Books';
}

export class AddBook {
  static readonly type = '[Books] Add Book';
  constructor(public payload: CreateBookDto) {}
}

export class UpdateBook {
  static readonly type = '[Books] Update Book';
  constructor(public id: string, public changes: UpdateBookDto) {}
}

export class DeleteBook {
  static readonly type = '[Books] Delete Book';
  constructor(public id: string) {}
}

export class SelectBook {
  static readonly type = '[Books] Select Book';
  constructor(public id: string | null) {}
}
