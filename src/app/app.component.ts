import { Component, TemplateRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { HomepageComponent } from './homepage/homepage.component';
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


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    HomepageComponent,
    HeaderComponent,
    MainactivitiesComponent,
    JoinUsFormComponent,
    LoginComponent,
    RegisterComponent,
    RouterOutlet,
    RouterLink,
    CommonModule,
    SignInUpComponent,
    MatDialogModule
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

  constructor(public dialog: MatDialog){};

    openDialog(){
      this.dialog.open(DialogBoxComponent,{
        width:'250px',
        data:"right click"
      })
    }


 /*  openModal(modalTemplate: TemplateRef<any>){
    this.modalService.open(modalTemplate, {size:'lg', title: 'Foo'}).subscribe((action: any) => {
      console.log('modalAction', action);
    })
  }
 */
  logout(): void {
    this.authService.logout;
  }
}



function openDialog() {
  throw new Error('Function not implemented.');
}

