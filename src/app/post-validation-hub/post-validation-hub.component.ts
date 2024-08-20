import { Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PostValidationComponent } from '../post-validation/post-validation.component';
import { AdditionalQuestionComponent } from '../additional-question/additional-question.component';


export interface Announcement {
  description: string;
  imageLink: string;
  title: string;
  username: string;
}

@Component({
  selector: 'app-post-validation-hub',
  standalone: true,
  imports: [
    CommonModule, 
  ],
  templateUrl: './post-validation-hub.component.html',
  styleUrls: ['./post-validation-hub.component.css']
})
export class PostValidationHubComponent implements OnInit {

  private firestore: Firestore = inject(Firestore);
  announcements: Announcement[] = [];

  constructor(public dialog: MatDialog) {}

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
      const subcollections = ["New Post"]; // Replace this with actual titles

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
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  approveAnnouncement(title: string) {
    console.log('Approved announcement with title:', title);
    // Implement approval logic here
  }

  rejectAnnouncement(title: string) {
    console.log('Rejected announcement with title:', title);
    // Implement rejection logic here
  }

  openDialog(title: string, description: string, imageUrl: string, username: string): void {
    this.dialog.open(PostValidationComponent, {
      data: {
        title,
        description,
        imageUrl,
        username
      }
    });
  }
  

  openAdditionalQuestionDialog(): void {
    this.dialog.open(AdditionalQuestionComponent, {});
  }
}
