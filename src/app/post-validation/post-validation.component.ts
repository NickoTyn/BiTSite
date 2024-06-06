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


@Component({
  selector: 'app-post-validation',
  standalone: true,
  imports: [MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule

  ],
  templateUrl: './post-validation.component.html',
  styleUrl: './post-validation.component.css'
})
export class PostValidationComponent {

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



}
