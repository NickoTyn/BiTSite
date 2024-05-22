import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-us-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './join-us-form.component.html',
  styleUrl: "./join-us-form.component.css" // Correcting the property name
})
export class JoinUsFormComponent {
  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    telnr: new FormControl(''),
    discord: new FormControl(''),
    additionalInfo: new FormControl('') // Adding the new form control
  });

  constructor() {
    // Add event listeners to the form controls to toggle a class when they have content
    this.applyForm.controls['firstName'].valueChanges.subscribe(() => {
      this.toggleFilledClass('firstName');
    });
    this.applyForm.controls['lastName'].valueChanges.subscribe(() => {
      this.toggleFilledClass('lastName');
    });
    this.applyForm.controls['email'].valueChanges.subscribe(() => {
      this.toggleFilledClass('email');
    });
    this.applyForm.controls['telnr'].valueChanges.subscribe(() => {
      this.toggleFilledClass('telnr');
    });
    this.applyForm.controls['discord'].valueChanges.subscribe(() => {
      this.toggleFilledClass('discord');
    });
  }

  // Function to toggle the 'filled' class based on whether the form control has content
  toggleFilledClass(controlName: string) {
    const control = this.applyForm.get(controlName);
    if (control && control.value !== '') {
      const inputElement = document.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.classList.add('filled');
      }
    } else {
      const inputElement = document.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.classList.remove('filled');
      }
    }
  }

  submitApplication() {
    // Your submit logic here
  }
}
