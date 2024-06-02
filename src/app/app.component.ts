import { Component, TemplateRef, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { HeaderComponent } from './header/header.component';
import { MainactivitiesComponent } from './mainactivities/mainactivities.component';
import { JoinUsFormComponent } from './join-us-form/join-us-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { SignInUpComponent } from './sign-in-up/components/sign-in-up.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { MakeAPostComponent } from './make-a-post/make-a-post.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';




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



