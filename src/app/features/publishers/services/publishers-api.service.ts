import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

@Injectable({ providedIn: 'root' })
export class PublishersApiService {
  private http = inject(HttpClient);
  private readonly resource = `${environment.apiUrl}/publishers`;

  getAll(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(this.resource);
  }

  create(dto: CreatePublisherDto): Observable<Publisher> {
    return this.http.post<Publisher>(this.resource, dto);
  }

  update(id: string, changes: UpdatePublisherDto): Observable<Publisher> {
    return this.http.patch<Publisher>(`${this.resource}/${id}`, changes);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }
}
