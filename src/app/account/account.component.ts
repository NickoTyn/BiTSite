import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MakeAPostComponent } from '../make-a-post/make-a-post.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    CommonModule
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

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

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

    this.authService.user$.subscribe(async user => {
      if (user) {
        this.username = user.displayName;
        this.photoURL = user.photoURL ?? null;
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        });

        const docRef = doc(this.authService.firestore, `users/${user.uid}`);
        const snap = await getDoc(docRef);
        const data = snap.data();
        if (data?.['profileImage']) {
          this.photoURL = data['profileImage'];
        }
      } else {
        this.username = null;
        this.photoURL = null;
        this.authService.currentUserSig.set(null);
      }
    });

    this.authService.userRank$.subscribe(rank => {
      this.userRank = rank;
    });
  }


  async isAdmin(): Promise<boolean> {
    return (await this.authService.getUserRank()) === 'admin';
  }

  async isModerator(): Promise<boolean> {
    return (await this.authService.getUserRank()) === 'moderator';
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

//ACCOUNT IMAGE START

imageChangedEvent: any = '';
croppedImage: string = '';

fileChangeEvent(event: any): void {
  console.log('📤 Image file selected:', event);
  this.imageChangedEvent = event;
}

imageCropped(event: ImageCroppedEvent) {
  this.croppedImage = event.base64!;
}

onSaveCroppedImage(): void {
  if (!this.croppedImage) return;

  this.authService.saveProfileImageToFirestore(this.croppedImage).then(() => {
    console.log('✅ Saved to Firestore');
    this.photoURL = this.croppedImage;
    this.imageChangedEvent = null;
    this.croppedImage = '';
  }).catch(err => {
    console.error('❌ Failed to save image:', err);
  });
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

  

  compressBase64Image(base64: string, maxSize = 50, quality = 0.6): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        // Maintain aspect ratio while resizing
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
  
        canvas.width = width;
        canvas.height = height;
  
        ctx?.drawImage(img, 0, 0, width, height);
  
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
  
      img.onerror = (err) => reject(err);
      img.src = base64;
    });
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


//ACCOUNT IMAGE END

//PASSWORD TOGGLE START

togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
  if (field === 'current') {
    this.showCurrentPassword = !this.showCurrentPassword;
    if (this.showCurrentPassword) {
      this.animatePasswordReveal(field);
    }
  } else if (field === 'new') {
    this.showNewPassword = !this.showNewPassword;
    if (this.showNewPassword) {
      this.animatePasswordReveal(field);
    }
  } else if (field === 'confirm') {
    this.showConfirmPassword = !this.showConfirmPassword;
    if (this.showConfirmPassword) {
      this.animatePasswordReveal(field);
    }
  }
}



animatePasswordReveal(field: 'current' | 'new' | 'confirm'): void {
  const control = this.updateForm.get(
    field === 'current' ? 'currentPassword' :
    field === 'new' ? 'newPassword' : 'confirmPassword'
  );

  if (!control) return;

  const fullValue = control.value;
  let index = 0;
  const interval = setInterval(() => {
    if (index <= fullValue.length) {
      control.setValue(fullValue.substring(0, index) + '•'.repeat(fullValue.length - index));
      index++;
    } else {
      control.setValue(fullValue); // Ensure final full value is set
      clearInterval(interval);
    }
  }, 50); // speed of typing
}



//PASSWORD TOGGLE END

  openDialog(): void {
    this.dialog.open(MakeAPostComponent);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
