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
import { AuthService } from '../auth.service';

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

  titleContent: string = '';
  descriptionContent: string = '';
  imageUploadForm: FormGroup;
  imageUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  fileName: string = 'Choose File';
  defaultImageUrl = 'https://via.placeholder.com/500';

  constructor(private fb: FormBuilder) {
    this.imageUploadForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fileName = file.name;
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        
        img.onload = () => {
          if (img.width === img.height) {
            this.imageUrl = reader.result;
            this.errorMessage = null;
            this.imageUploadForm.get('image')?.setValue(file);
          } else {
            this.errorMessage = 'The image must be 1x1 aspect ratio.';
            this.imageUrl = null;
            this.imageUploadForm.get('image')?.setValue(null);
          }
        };
      };

      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.imageUploadForm.valid) {
      // Handle the form submission logic here
      console.log('Form submitted successfully!');
    }
  }
}