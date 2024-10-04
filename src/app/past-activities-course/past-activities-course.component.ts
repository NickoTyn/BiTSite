import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { Firestore, collection, doc, getDocs, getDoc, setDoc, writeBatch, CollectionReference, DocumentData, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule here
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-past-activities-course',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './past-activities-course.component.html',
  styleUrl: './past-activities-course.component.css'
})



export class PastActivitiesCourseComponent {
submitApplication() {
throw new Error('Method not implemented.');
}

  announcement: Announcement | undefined = {
    title: 'Default Title',
    description: 'Default Description',
    refLink: '',
    username: 'Default User',
    imageLink: 'default-image-url.jpg',
    date: '',
    status: 'past-activities',
    pastActivity: true,
    imagesRef: 'none',
    typeRef: '/past-activities-gallery'
  };

  classes = [
    {
      title: 'Class 1: Introduction',
      date: new Date(2023, 9, 1),
      description: 'In this class, we cover the basics of the course.',
      materials: [
        { name: 'Class 1 Notes', link: 'path_to_notes.pdf' },
        { name: 'Class 1 Presentation', link: 'path_to_presentation.pdf' }
      ],
      videos: [
        { title: 'Introduction Video', link: 'https://video_link_1.com' }
      ]
    },
    {
      title: 'Class 2: Advanced Topics',
      date: new Date(2023, 9, 8),
      description: 'In this class, we dive into advanced topics.',
      materials: [
        { name: 'Class 2 Notes', link: 'path_to_notes.pdf' },
        { name: 'Class 2 Exercises', link: 'path_to_exercises.pdf' }
      ],
      videos: []
    }
  ];

  private firestore: Firestore = inject(Firestore);

  public classesQueue = [];

  isFormVisible = false; // This controls the visibility of the form  

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      const state = history.state as { galleryRef: string; announcement: Announcement };
    });
  };

  isQueueNull() {
    // Check if the queue is null or has no items
    return this.classesQueue === null || this.classesQueue.length === 0;
  }

  async fetchClasses() {
    try {
      // Reference to the 'validated-posts' collection
      const collectionRef = collection(this.firestore, `validated-posts/Test for Courses/Courses`);
      const collectionSnapshot = await getDocs(collectionRef);

      // Check if the collection has documents
      if (collectionSnapshot.empty) {
        console.log('No documents found in the validated-posts collection.');
        this.classesQueue = [];
        return;
      }

      // Clear the queue before adding new data
      this.classesQueue = [];

      

      // Iterate over the documents and add them to the queue
      collectionSnapshot.forEach(doc => {
        if (this.classesQueue.length >= 6) {
          return; // Stop adding more if queue already has 6 items
        }

        const data = doc.data() as Omit<Announcement, 'title'>; // Assuming `Announcement` type


        /* this.queue.push({
            title: doc.id, // Assuming the document ID or a specific field should be used as title
            ...data
        }); */
      });

      // Log the fetched data
      //console.log('Fetched Announcements:', this.queue);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  addNewClass() {
    this.isFormVisible = !this.isFormVisible; // Toggle the form visibility
  }

  onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    this.isFormVisible = false; // Optionally hide the form after submission
  }

  selectedFile: File | undefined | null;

  triggerFileUpload() {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  loadMoreClasses() {
    // Logic to load more classes
  }
}
