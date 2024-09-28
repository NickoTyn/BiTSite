import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../auth.service';
import { MakeAPostComponent } from '../make-a-post/make-a-post.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore } from 'firebase-admin/firestore';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
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

  isAdminUser: boolean = false;
  isModeratorUser: boolean = false;

  userRank: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      newUsername: ['', Validators.required],
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.isAdminUser = await this.isAdmin();
    this.isModeratorUser = await this.isModerator();

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

    this.authService.userRank$.subscribe(rank => {
      this.userRank = rank;
      console.log('User rank:', this.userRank);
    });
  }



 

  async isAdmin(): Promise<boolean> {
    const userRank = await this.authService.getUserRank();
    console.log("USER RANK", userRank);
    return userRank === 'admin';
  }

  async isModerator(): Promise<boolean> {
    const userRank = await this.authService.getUserRank();
    console.log("USER RANK", userRank);
    return userRank === 'moderator';
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
    this.authService.logout();  // Call the logout method from your AuthService
    this.router.navigate(['/']); // Navigate to the homepage (root route)
  }

}
