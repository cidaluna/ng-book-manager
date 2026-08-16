import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private http = inject(HttpClient);
  private readonly resource = `${environment.apiUrl}/books`;

  /** Busca todos os livros; filtro opcional por editora usando query param do json-server. */
  getAll(publisherId?: string): Observable<Book[]> {
    const params = publisherId ? new HttpParams().set('publisherId', publisherId) : undefined;
    return this.http.get<Book[]>(this.resource, { params });
  }

  /** Cria um novo livro. O id é gerado pelo json-server. */
  create(dto: CreateBookDto): Observable<Book> {
    return this.http.post<Book>(this.resource, dto);
  }

  /** Atualiza parcialmente um livro existente (PATCH, não PUT — preserva campos não enviados). */
  update(id: string, changes: UpdateBookDto): Observable<Book> {
    return this.http.patch<Book>(`${this.resource}/${id}`, changes);
  }

  /** Remove um livro pelo id. */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }
}
