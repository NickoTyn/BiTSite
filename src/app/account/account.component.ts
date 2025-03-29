import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MakeAPostComponent } from '../make-a-post/make-a-post.component';

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
export class AccountComponent implements OnInit {

  updateForm: FormGroup;
  username: string | null = null;
  userRank: string | null = null;
  isAdminUser: boolean = false;
  isModeratorUser: boolean = false;

  photoURL: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

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
        this.photoURL = user.photoURL ?? null;
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
        console.log('🔥 User from auth:', user);
      } else {
        this.username = null;
        this.photoURL = null;
        this.authService.currentUserSig.set(null);
      }

      if (user) {
        console.log('📸 user.photoURL:', user.photoURL);
      }
      
    });

    this.authService.userRank$.subscribe(rank => {
      this.userRank = rank;
    });
    
  }

  async isAdmin(): Promise<boolean> {
    const userRank = await this.authService.getUserRank();
    return userRank === 'admin';
  }

  async isModerator(): Promise<boolean> {
    const userRank = await this.authService.getUserRank();
    return userRank === 'moderator';
  }

  onUpdateUsername() {
    const newUsername = this.updateForm.get('newUsername')?.value;
    if (newUsername) {
      this.authService.updateDisplayName(newUsername).subscribe({
        next: () => {
          this.username = newUsername;
          console.log('✅ Username updated');
        },
        error: err => console.error('❌ Error updating username:', err)
      });
    }
  }

  onChangePassword() {
    const currentPassword = this.updateForm.get('currentPassword')?.value;
    const newPassword = this.updateForm.get('newPassword')?.value;
    const confirmPassword = this.updateForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      console.error('❌ New password and confirmation do not match');
      return;
    }

    if (currentPassword && newPassword) {
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => console.log('✅ Password changed'),
        error: err => console.error('❌ Error changing password:', err)
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSaveProfileImage(): void {
    if (this.previewUrl) {
      this.authService.updateProfilePhoto(this.previewUrl).subscribe({
        next: () => {
          console.log('✅ Profile photo updated');
          this.photoURL = this.previewUrl;
        },
        error: err => console.error('❌ Error updating profile photo:', err)
      });
    }
  }

  openDialog(): void {
    this.dialog.open(MakeAPostComponent);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
