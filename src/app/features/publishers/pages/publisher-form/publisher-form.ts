import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { PublishersState } from '../../state/publishers.state';
import { AddPublisher, UpdatePublisher } from '../../state/publishers.actions';

@Component({
  selector: 'app-publisher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publisher-form.html',
  styleUrl: './publisher-form.scss',
})
export class PublisherForm implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private editingId: string | null = null;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['', Validators.required],
    foundedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1400)]],
  });

  /** Detecta modo edição pela presença de :id na rota e pré-preenche o form via snapshot do state. */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editingId = id;
    const publisher = this.store.selectSnapshot(PublishersState.items).find(p => p.id === id);
    if (publisher) {
      this.form.patchValue(publisher);
    }
  }

  /** Despacha Add ou Update conforme o modo e só navega após a ação NGXS resolver. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const action = this.editingId
      ? new UpdatePublisher(this.editingId, value)
      : new AddPublisher(value);

    // dispatch() retorna um Observable que completa quando a action (e efeitos)
    // terminam — por isso o navigate só acontece depois do PATCH/POST resolver.
    this.store.dispatch(action).subscribe(() => this.router.navigate(['/publishers']));
  }
}
