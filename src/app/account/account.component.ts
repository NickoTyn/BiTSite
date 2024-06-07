import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../auth.service';
import { MakeAPostComponent } from '../make-a-post/make-a-post.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MakeAPostComponent,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})


export class AccountComponent {



  updateForm: FormGroup;
  username: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog
  ) {
    this.updateForm = this.fb.group({
      newUsername: ['', Validators.required],
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.username = user.displayName;
      } else {
        this.username = null;
      }
    });

    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }


  isAdmin(): boolean {
    return this.authService.getUserRank() === 'admin';
  }

  onUpdateUsername() {
    const newUsername = this.updateForm.get('newUsername')?.value;
    if (newUsername) {
      this.authService.updateDisplayName(newUsername)
        .subscribe({
          next: () => {
            console.log('Display name updated successfully');
            this.username = newUsername;
          },
          error: err => console.error('Error updating display name:', err)
        });
    }
  }


  onChangePassword() {
    const currentPassword = this.updateForm.get('currentPassword')?.value;
    const newPassword = this.updateForm.get('newPassword')?.value;
    const confirmPassword = this.updateForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      console.error('New password and confirm password do not match');
      return;
    }

    if (currentPassword && newPassword) {
      this.authService.changePassword(currentPassword, newPassword)
        .subscribe({
          next: () => {
            console.log('Password changed successfully');
          },
          error: err => console.error('Error changing password:', err)
        });
    }
  }

  openDialog(): void {
    this.dialog.open(MakeAPostComponent, {
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
