import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { HeaderComponent } from '../header/header.component';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-join-us-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './join-us-form.component.html',
  styleUrls: ['./join-us-form.component.css']
})
export class JoinUsFormComponent implements OnInit {
  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    telnr: new FormControl(''),
    discord: new FormControl(''),
    additionalInfo: new FormControl('')
  });

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  authService = inject(AuthService);
  headerComponent = inject(HeaderComponent);

  user$: Observable<any> = authState(this.auth); // Observable for user state

  showNotification = false;

  constructor() {
    this.applyForm.controls['firstName'].valueChanges.subscribe(() => {
      this.toggleFilledClass('firstName');
    });
    this.applyForm.controls['lastName'].valueChanges.subscribe(() => {
      this.toggleFilledClass('lastName');
    });
    this.applyForm.controls['email'].valueChanges.subscribe(() => {
      this.toggleFilledClass('email');
    });
  }

  ngOnInit(): void {
    this.checkUserApplicationStatus();
  }

  async checkUserApplicationStatus() {
    this.user$.subscribe(async (user) => {
      console.log("USER:", user);
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists() && docSnap.data()["joinUs"]) {
          this.showNotification = true; // User has already applied
        } else {
          this.showNotification = false; // User has not applied
        }
      } else {
        this.showNotification = false; // User is not logged in or not available
      }
    });
  }

  toggleFilledClass(controlName: string) {
    const control = this.applyForm.get(controlName);
    if (control && control.value !== '') {
      control.updateValueAndValidity(); // Update the validation status
      control.markAsDirty(); // Mark the control as dirty to trigger validation
    }
  }

  async submitApplication() {
    this.user$.subscribe(async (user) => {
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userDoc, {
          joinUs: true,
          ...this.applyForm.value
        }, { merge: true });

        this.showNotification = true; // Set notification after successful submission
      }
    });
  }
}
