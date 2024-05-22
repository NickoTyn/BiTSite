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
    email: new FormControl('')
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
  }

  // Function to toggle the 'filled' class based on whether the form control has content
  toggleFilledClass(controlName: string) {
    const control = this.applyForm.get(controlName);
    if (control && control.value !== '') {
      control.updateValueAndValidity(); // Update the validation status
      control.markAsDirty(); // Mark the control as dirty to trigger validation
    }
  }

  submitApplication() {
    // Your submit logic here
  }
}
