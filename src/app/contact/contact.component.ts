import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  onInputFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.classList.add('touched');
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      if (input.value) {
        input.classList.add('filled');
      } else {
        input.classList.remove('filled');
      }
    }
  }
}