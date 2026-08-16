import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { PublishersState } from '../../state/publishers.state';
import { AddPublisher, AddPublisherFail, AddPublisherSuccess, UpdatePublisher, UpdatePublisherFail, UpdatePublisherSuccess } from '../../state/publishers.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private actions$ = inject(Actions);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private editingId: string | null = null;
  errorMessage = signal<string | null>(null);


  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['', Validators.required],
    foundedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1400)]],
  });

  constructor() {
    this.actions$
      .pipe(ofActionSuccessful(AddPublisherSuccess, UpdatePublisherSuccess), takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/publishers']));

    this.actions$
      .pipe(ofActionSuccessful(AddPublisherFail, UpdatePublisherFail), takeUntilDestroyed())
      .subscribe(action => this.errorMessage.set(action.message));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editingId = id;
    const publisher = this.store.selectSnapshot(PublishersState.items).find(p => p.id === id);
    if (publisher) {
      this.form.patchValue(publisher);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const action = this.editingId
      ? new UpdatePublisher(this.editingId, value)
      : new AddPublisher(value);

    this.store.dispatch(action);
  }
}
