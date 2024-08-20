import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';


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

  announcements: Announcement[] = [];

  titleContent: string = '';
  descriptionContent: string = '';
  defaultImageUrl = 'https://via.placeholder.com/500';
  imageUrl: string | null;


  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; description: string; imageUrl: string}
  ) {
    this.titleContent = data.title;
    this.descriptionContent = data.description;
    this.imageUrl = data.imageUrl || this.defaultImageUrl;
  }

  ngOnInit() {
  }


  




}
