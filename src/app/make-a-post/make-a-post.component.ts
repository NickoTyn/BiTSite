import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection } from '@angular/fire/firestore';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-make-a-post',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './make-a-post.component.html',
  styleUrls: ['./make-a-post.component.css']
})
export class MakeAPostComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // Observable for the current user
  user$: Observable<any> = authState(this.auth);

  titleContent: string = '';
  descriptionContent: string = '';
  linkContent: string = '';
  imageUploadForm: FormGroup;
  imageUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  fileName: string = 'Choose File';
  defaultImageUrl = 'https://via.placeholder.com/500';
  file: File | null = null;

  constructor(public dialogRef: MatDialogRef<MakeAPostComponent>) {
    this.imageUploadForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0];
      this.fileName = this.file.name;
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          if (img.width === img.height) {
            this.imageUrl = reader.result;
            this.errorMessage = null;
            this.imageUploadForm.get('image')?.setValue(this.file);
          } else {
            this.errorMessage = 'The image must be 1x1 aspect ratio.';
            this.imageUrl = null;
            this.imageUploadForm.get('image')?.setValue(null);
          }
        };
      };

      reader.readAsDataURL(this.file);
    }
  }

  async onSubmit() {
    let downloadURL: string;
    const currentDate = new Date();

    if (this.imageUploadForm.valid) {
      console.log('Form submitted successfully!');
      downloadURL = await this.uploadPhoto();
    }

    this.user$.pipe(take(1)).subscribe(async (user) => {
      if (user) {
        const postCollection = collection(this.firestore, 'non-validated-post');
        const postDoc = doc(postCollection, this.titleContent);
        await setDoc(
          postDoc,
          {
            title: this.titleContent,
            description: this.descriptionContent,
            refLink: this.linkContent,
            username: user.displayName || user.username,
            imageLink: downloadURL,
            status: 'none',
            pastActivity: false,
            date: currentDate
          },
          { merge: true }
        );
      }
    });
    this.dialogRef.close();
    alert('Post submitted successfully! Please wait for the admin to validate it.');
  }

  async uploadPhoto(): Promise<string> {
    const storage = getStorage();
    return new Promise((resolve, reject) => {
      this.user$.pipe(take(1)).subscribe(async (user) => {
        if (user) {
          const folder = ref(storage, `make_a_post/${user.uid}/${this.titleContent}/${this.fileName}`);
          if (this.file) {
            await uploadBytes(folder, this.file);
            console.log('Uploaded a blob or file!');
          }
          try {
            const downloadURL = await getDownloadURL(folder);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        } else {
          reject('No user found');
        }
      });
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
