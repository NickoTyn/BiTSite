
import { Component, Renderer2, TemplateRef, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { HeaderComponent } from './header/header.component';


import { FormsModule } from '@angular/forms';


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
import { PostValidationComponent } from './post-validation/post-validation.component';

import { PostValidationHubComponent } from './post-validation-hub/post-validation-hub.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { GoogleMapsModule } from "@angular/google-maps";
import { BrowserModule } from '@angular/platform-browser';
import { Auth, authState, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { PolicyAndCookiesComponent } from './policy-and-cookies/policy-and-cookies.component';
import { Firestore, doc, setDoc, getDoc, collection, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';








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
    PostValidationHubComponent,
    PostValidationComponent,
    GoogleMapsModule,
    PolicyAndCookiesComponent,
  ]
})
export class AppComponent {
  title = 'BiTSite';

  constructor(private renderer: Renderer2) { }

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);

  user$: Observable<any> = authState(this.auth); // Observable for user state


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


    const cookiesBtn = this.renderer.selectRootElement('#cookies-btn', true);
    this.renderer.listen(cookiesBtn, 'click', () => {
      const cookiesElement = this.renderer.selectRootElement('#cookies', true);
      this.renderer.setStyle(cookiesElement, 'display', 'none');
      this.setCookie('cookie', true , 30);
    });

    window.addEventListener('load', this.cookieMessage);
  }


  showSignInPopup: boolean = false;

  saveCookie(){
    this.user$.subscribe(async (user) => {
      console.log("USER:", user);
      if (user) {
        const cookielocation = doc(this.firestore, `users/${user.uid}`);
        
        // Update the Firestore document to set `cookies` to true
        await setDoc(cookielocation, {
          cookies: true
        });
        console.log("Cookies set to true in Firestore");
      }
    });
  }

  setCookie(cName: string, cValue: boolean, exDays: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (exDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${cName}=${cValue};${expires};path=/,path=/past-activities`;
  }

  getCookie = (cName: string) => {
    const name = cName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    let value;
    ca.forEach(val => {
      if (val.indexOf(name) === 0) {
        value = val.substring(name.length);
      }
    });
    return value;
  }

  cookieMessage =()=>{ 
    if(!this.getCookie('cookie')) {
      const cookiesElement = document.querySelector('#cookies') as HTMLElement;
      cookiesElement.style.display = 'block';
    }
  }

}






