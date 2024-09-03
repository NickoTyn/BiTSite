import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-make-a-post',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,

    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './make-a-post.component.html',
  styleUrl: './make-a-post.component.css'
})

export class MakeAPostComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);


  user$: Observable<any> = authState(this.auth); // Observable for user state

  titleContent: string = '';
  descriptionContent: string = '';
  imageUploadForm: FormGroup;
  imageUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  fileName: string = 'Choose File';
  defaultImageUrl = 'https://via.placeholder.com/500';
  file: File | null = null;

  downloadURL: string | null = null;



  constructor() {
    this.imageUploadForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void { }

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

    if (this.imageUploadForm.valid) {
        console.log('Form submitted successfully!');
        downloadURL = await this.uploadPhoto();
    }

    this.user$.pipe(take(1)).subscribe(async (user) => {
        if (user) {
            // Reference to the new collection under the user's document
            const userCollection = collection(this.firestore, `users/${user.uid}/${this.titleContent}`);
            const postCollection = collection(this.firestore, `non-validated-post`);

            // Create a new document in the 'titles' collection with auto-generated ID
            const newTitleDoc = doc(userCollection);
            await setDoc(newTitleDoc, {
                title: this.titleContent,
                description: this.descriptionContent,
                imageLink: downloadURL
            }, { merge: true });

            // Use the title as the document ID for the post document
            const postDoc = doc(postCollection, this.titleContent);
            await setDoc(postDoc, {
                title: this.titleContent,
                description: this.descriptionContent,
                username: user.displayName || user.username,
                imageLink: downloadURL,
                status: 'none',
                pastActivity: false
            }, { merge: true });
        }
    });
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
}