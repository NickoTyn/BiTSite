import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginComponent } from '../login/login.component';
//import { RegisterComponent } from '../register/register.component';
import { AuthService } from '../auth.service';
import {MatIconModule} from '@angular/material/icon';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { CommonModule } from '@angular/common';
import { updateCurrentUser } from '@angular/fire/auth';

@Component({
  selector: 'app-dialog-box',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,
    LoginComponent,
    ReactiveFormsModule,
    RegisterComponent,
    CommonModule
  ],
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent implements OnInit {
  constructor() {  
    

}





  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

/*   fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  }); */

  isSubmitted=false;
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
username:this.fb.control('',{validators: [Validators.required]}),
email:this.fb.control('',{validators: [Validators.required, Validators.email]}),
password:this.fb.control('',{validators: [Validators.required, Validators.minLength(6)]}),
  });


  errorMessage: string | null = null;

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

  onSubmit(action: 'login' | 'register'): void {

    const rawForm = this.form.getRawValue();
    let authObservable;

    if (action === 'login') {
      authObservable = this.authService.login(rawForm.email, rawForm.password);
    } else if (action === 'register') {
      authObservable = this.authService.register(rawForm.email, rawForm.username, rawForm.password);
    }

    if (authObservable) {
      authObservable.subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.errorMessage = err.code;
        }
      });
    }
    this.isSubmitted = true;


  }

 

}



/*   showLogin = true;
  showRegister = false;




    toggleLoginComponent(){
      this.showLogin = !this.showLogin;
      this.showRegister = !this.showRegister;
    } 
  
    toggleRegisterComponent() {
      this.showRegister = !this.showRegister;
      this.showLogin = !this.showLogin;
    } */









/* document.addEventListener('DOMContentLoaded', () => {
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
 */
