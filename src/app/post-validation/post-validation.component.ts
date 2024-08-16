import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Firestore, collection, doc, getDocs, getDoc } from '@angular/fire/firestore';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';


@Component({
  selector: 'app-post-validation',
  standalone: true,
  imports: [MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule

  ],
  templateUrl: './post-validation.component.html',
  styleUrl: './post-validation.component.css'
})
export class PostValidationComponent {

  announcements: Announcement[] = [];

  titleContent: string = '';
  descriptionContent: string = '';
  imageUploadForm: FormGroup;
  imageUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  fileName: string = 'Choose File';
  defaultImageUrl = 'https://via.placeholder.com/500';

  private firestore: Firestore = inject(Firestore);

  constructor(private fb: FormBuilder) {
    this.imageUploadForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.fetchAnnouncements();
  }


  
  async fetchAnnouncements() {
    try {
      // Reference to the document 'non-validated-post-id' in the collection 'non-validated-post'
      const docRef = doc(this.firestore, 'non-validated-post/YUVQgiBG57gEiOPk1YVx');
      const docSnap = await getDoc(docRef);

      // Check if the document exists
      if (!docSnap.exists()) {
        console.log('Document with ID non-validated-post-id does not exist.');
        this.announcements = [];
        return;
      }

      // Get a list of subcollection titles (assumed to be direct children of the document)
      const subcollections = ['Test', 'Post2']; // Replace this with actual titles

      for (const title of subcollections) {
        const subcollectionRef = collection(docRef, title);
        const subcollectionDocs = await getDocs(subcollectionRef);

        subcollectionDocs.forEach(doc => {
          const data = doc.data() as Omit<Announcement, 'title'>;
          this.announcements.push({
            title, 
            ...data
          });
        });
      }

      // Log the fetched data
      console.log('Fetched announcements:', this.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }



}
