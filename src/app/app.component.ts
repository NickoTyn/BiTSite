import { Component, TemplateRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { HeaderComponent } from './header/header.component';
import { MainactivitiesComponent } from './mainactivities/mainactivities.component';
import { JoinUsFormComponent } from './join-us-form/join-us-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { SignInUpComponent } from './sign-in-up/components/sign-in-up.component';
import { SignInUpService } from './sign-in-up/services/modal.service';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { AccountComponent } from './account/account.component';
import { MakeAPostComponent } from './make-a-post/make-a-post.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';



@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    MainactivitiesComponent,
    JoinUsFormComponent,
    LoginComponent,
    RegisterComponent,
    RouterOutlet,
    RouterModule,
    RouterLink,
    CommonModule,
    SignInUpComponent,
    MatDialogModule, 
    MakeAPostComponent,
  ]
})
export class AppComponent {
  title = 'BiTSite';

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
    })
  }

}



