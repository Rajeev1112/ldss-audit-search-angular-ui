import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export type UserRole = 'admin' | 'normal' | 'other';

export interface LoggedInUser {
  id: string;
  role: UserRole;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  @Output() readonly loginSucceeded = new EventEmitter<LoggedInUser>();

  readonly roles: UserRole[] = ['admin', 'normal', 'other'];
  readonly userIds = ['USR1042', 'USR1068', 'USR1017'];

  readonly loginForm = this.fb.group({
    role: this.fb.control<UserRole>('normal', { nonNullable: true, validators: Validators.required }),
    userId: this.fb.control('', { nonNullable: true, validators: Validators.required })
  });

  attempted = false;

  login(): void {
    this.attempted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.getRawValue();
    this.loginSucceeded.emit({ id: value.userId, role: value.role });
  }
}
