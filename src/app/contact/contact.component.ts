import { Component, inject, OnInit } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoogleMap } from '@angular/google-maps';



@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);

  name: string = '';
  email: string = '';
  phoneNumber: string = '';
  additionalInfo: string = '';

  /*MAP START*/ 

  auLocation: any =  {lat: 45.79023417226743, lng: 24.14627412823332}

  handleMapInitialized(map: google.maps.Map) {
    new google.maps.Marker({
      position: this.auLocation,
      map,
    })
  }

  isScreenWidthGreaterThan750(): boolean {
    return window.innerWidth > 750;
}

  options: google.maps.MapOptions = {
    mapId: "DEMO_MAP_ID",
    center: this.auLocation,
    zoom: 13,
    mapTypeControl: false,
    
  };

  /*MAP END*/

  async ngOnInit() { }



  async onSubmit(form: NgForm) {
    if (form.valid) {
      const contactMessage = {
        name: this.name,
        email: this.email,
        phoneNumber: this.phoneNumber,
        additionalInfo: this.additionalInfo,
        timestamp: new Date()
      };

      try {
        await setDoc(doc(collection(this.firestore, 'contactMessages')), contactMessage);
        console.log('Document written successfully.');
        form.reset(); // Reset the form after submission
      } catch (error) {
        console.error('Error adding document: ', error);
        alert('Error sending message. Please try again.');
      }
    } else {
      alert('Please fill out all fields.');
    }
  }

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
