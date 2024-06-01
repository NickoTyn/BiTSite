import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
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
export class MakeAPostComponent {

  constructor() { }
 
  onNoClick(): void {
    // Close dialog logic can be handled in the DialogService
  }


}
