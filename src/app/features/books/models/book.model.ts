export interface Book {
  id: string;
  title: string;
  isbn: string;
  publisherId: string;   // FK lógica -> Publisher.id
  publishedYear: number;
  pages: number;
  available: boolean;
}

// Usado no form de criação — sem 'id' pois é gerado pelo json-server
export type CreateBookDto = Omit<Book, 'id'>;
export type UpdateBookDto = Partial<CreateBookDto>;
