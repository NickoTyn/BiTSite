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
  selector: 'app-dialog-box',
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
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent implements OnInit {

  constructor() { }

  authService = inject(AuthService);

  ngOnInit(): void {
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

  onNoClick(): void {
    // Close dialog logic can be handled in the DialogService
  }

  showLogin = true;
  showRegister = false;



  
    toggleLoginComponent(){
      this.showLogin = !this.showLogin;
      this.showRegister = !this.showRegister;
    } 
  
    toggleRegisterComponent() {
      this.showRegister = !this.showRegister;
      this.showLogin = !this.showLogin;
    }



}


document.addEventListener('DOMContentLoaded', () => {
  const changeClassButton = document.getElementById('changeClassButton');
  const resetClassButton = document.getElementById('resetClassButton');

  if (changeClassButton && resetClassButton) {
    changeClassButton.addEventListener('click', changeClass);
    resetClassButton.addEventListener('click', resetClass);
  }
});

function changeClass() {
  const myDiv = document.getElementById('registerComponent');
  if (myDiv) {
    myDiv.className = 'loginComponent';
  }
}

// Function to reset the class of the div
function resetClass() {
  const myDiv = document.getElementById('loginComponent');
  if (myDiv) {
    myDiv.className = 'registerComponent';
  }
}

