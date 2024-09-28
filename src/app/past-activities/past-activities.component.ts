import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, setDoc, writeBatch, CollectionReference, DocumentData, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PostValidationComponent } from '../post-validation/post-validation.component';
import { AdditionalQuestionComponent } from '../additional-question/additional-question.component';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-past-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './past-activities.component.html',
  styleUrl: './past-activities.component.css'
})
export class PastActivitiesComponent {


  private firestore: Firestore = inject(Firestore);
  announcements: Announcement[] = [];

  constructor(public dialog: MatDialog, private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
    this.fetchAnnouncements();
  }


  async fetchAnnouncements() {
    try {
      // Reference to the 'validated-post' collection
      const collectionRef = collection(this.firestore, 'validated-posts');
  
      // Query to get documents where status is 'past-activities'
      const queryRef = query(collectionRef, where('pastActivity', '==', true));
      const querySnapshot = await getDocs(queryRef);
  
      // Check if there are any documents returned by the query
      if (querySnapshot.empty) {
        console.log('No documents with status "past-activities" found.');
        this.announcements = [];
        return;
      }
  
      // Prepare an array to hold the fetched announcements

  
      // Loop through each document returned by the query
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as Omit<Announcement, 'title'>;
  
        // Add the document data to the announcements array
        this.announcements.push({
          title: docSnap.id,  // Assuming you want the document ID as the title, adjust as necessary
          ...data
        });
      }
  
      this.announcements = this.sortAnnouncementsByDate(this.announcements);
  
      // Optionally log the fetched data
      console.log('Fetched announcements:', this.announcements);
  
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }
  
  sortAnnouncementsByDate(announcements: any[]) {
    // Sort by date in descending order (most recent first)
    return announcements.sort((a, b) => {
      const dateA = a.date ? a.date.toDate() : 0; // Convert Firestore timestamp to JS Date
      const dateB = b.date ? b.date.toDate() : 0;
      return dateB - dateA;
    });
  }

  onPostWrapperClick(event: Event, redirectUrl: string, galleryRef: string, announcement: Announcement) {
    const target = event.currentTarget as HTMLElement;
    this.renderer.addClass(target, 'active');
  
    setTimeout(() => {
      this.router.navigate([redirectUrl], { state: { galleryRef, announcement } });
    }, 2350);
  }
  
  
}
