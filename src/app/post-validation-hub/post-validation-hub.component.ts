import { Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, DocumentReference, DocumentData, onSnapshot, query, orderBy } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PostValidationComponent } from '../post-validation/post-validation.component';
import { AdditionalQuestionComponent } from '../additional-question/additional-question.component';
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';

export interface Announcement {
  description: string;
  imageLink: string | '';
  title: string;
  refLink: string;
  username: string;
  status: string;
  pastActivity: true;
  imagesRef: string;
  date: string | Date;
  typeRef: string;
}

@Component({
  selector: 'app-post-validation-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-validation-hub.component.html',
  styleUrls: ['./post-validation-hub.component.css']
})
export class PostValidationHubComponent implements OnInit {

  private firestore: Firestore = inject(Firestore);
  public announcementsSubject = new BehaviorSubject<Announcement[]>([]);
  announcements$ = this.announcementsSubject.asObservable();

  imageUrls: string[] = [];
  currentAnnouncement: string | null = null; // To track the selected announcement

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.listenToAnnouncements();
  }

  listenToAnnouncements() {
    const collectionRef = collection(this.firestore, 'non-validated-post');
    const q = query(collectionRef, orderBy('date', 'desc')); // Order by date in descending order
    
    onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log('No documents found in the collection non-validated-post.');
        this.announcementsSubject.next([]);
        return;
      }
  
      const announcements: Announcement[] = [];
  
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Omit<Announcement, 'title'>;
        const title = docSnap.id;
  
        announcements.push({
          title,
          ...data
        });
      });
  
      this.announcementsSubject.next(announcements);
      console.log('Fetched and sorted announcements:', announcements);
    }, (error) => {
      console.error('Error listening to announcements:', error);
    });
  }
  

  sortAnnouncementsByDate(announcements: Announcement[]) {
    // Sort by date in descending order (newest first)
    return announcements.sort((a, b) => {
      // Ensure both dates are valid
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return dateB - dateA; // Change to descending order (newest first)
    });
  }
  

  async approveAnnouncement(title: string) {
    console.log('Approved announcement with title:', title);

    const sourcePath = `non-validated-post/${title}`;
    const destinationPath = `validated-posts/${title}`;

    // Reference to source document
    const sourceDocRef = doc(this.firestore, sourcePath);

    // Reference to destination document
    const destinationDocRef = doc(this.firestore, destinationPath);

    try {
      // Copy document data
      await this.copyDocument(sourceDocRef, destinationDocRef);

      console.log('Document successfully copied to', destinationPath);

      // Update status
      await setDoc(sourceDocRef, { status: 'approved' }, { merge: true });
      await setDoc(destinationDocRef, { status: 'approved' }, { merge: true });
      console.log('Status updated to Approved');

    } catch (error) {
      console.error('Error processing document:', error);
    }
  }

  async copyDocument(sourceDocRef: DocumentReference<DocumentData>, destinationDocRef: DocumentReference<DocumentData>) {
    try {
      const docSnap = await getDoc(sourceDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await setDoc(destinationDocRef, data);
      } else {
        throw new Error('Source document does not exist');
      }
    } catch (error) {
      console.error('Error copying document:', error);
      throw error;
    }
  }

  rejectAnnouncement(title: string) {
    this.dialog.open(AdditionalQuestionComponent, {
      data: { title }
    });
  }

  openDialog(title: string, description: string, imageUrl: string, username: string): void {
    this.dialog.open(PostValidationComponent, {
      data: { title, description, imageUrl, username }
    });
  }

  async deactivateAnnouncement(title: string) {
    const sourcePath = `non-validated-post/${title}`;
    const destinationPath = `validated-posts/${title}`;

    // Reference to source document
    const sourceDocRef = doc(this.firestore, sourcePath);

    // Reference to destination document
    const destinationDocRef = doc(this.firestore, destinationPath);

    try {
      // Copy document data
      await this.copyDocument(sourceDocRef, destinationDocRef);

      // Update status
      await setDoc(sourceDocRef, { status: 'deactivated' }, { merge: true });
      await setDoc(destinationDocRef, { status: 'deactivated' }, { merge: true });

    } catch (error) {
      console.error('Error processing document:', error);
    }
  }

  async pinAnnouncement(title: string): Promise<void> {
    const sourcePath = `non-validated-post/${title}`;
    const destinationPath = `validated-posts/${title}`;

    // Reference to source and destination documents
    const sourceDocRef = doc(this.firestore, sourcePath);
    const destinationDocRef = doc(this.firestore, destinationPath);

    try {
      // Copy document data
      await this.copyDocument(sourceDocRef, destinationDocRef);

      // Update status
      await setDoc(sourceDocRef, { pastActivity: true }, { merge: true });
      await setDoc(destinationDocRef, { pastActivity: true }, { merge: true });

      console.log('Announcement pinned:', title);
    } catch (error) {
      console.error('Error pinning announcement:', error);
    }
  }

  selectAnnouncementType(title: string): void {
    this.currentAnnouncement = this.currentAnnouncement === title ? null : title;
  }

  async updateTypeRef(event: Event, title: string): Promise<void> {
    const selectedType = (event.target as HTMLSelectElement).value;
    if (!selectedType) return;

    const docRef = doc(this.firestore, `non-validated-post/${title}`);
    try {
      // Update the typeRef in Firebase
      await setDoc(docRef, { typeRef: selectedType }, { merge: true });
      console.log(`Type updated to ${selectedType} for ${title}`);

      // Call the pinAnnouncement function after updating typeRef
      await this.pinAnnouncement(title);
    } catch (error) {
      console.error('Error updating typeRef or pinning announcement:', error);
    } finally {
      this.currentAnnouncement = null; // Hide the selector after updating
    }

    const docRef2 = doc(this.firestore, `validated-posts/${title}`);
    try {
      // Update the typeRef in Firebase
      await setDoc(docRef2, { typeRef: selectedType }, { merge: true });
      console.log(`Type updated to ${selectedType} for ${title}`);

      // Call the pinAnnouncement function after updating typeRef
      await this.pinAnnouncement(title);
    } catch (error) {
      console.error('Error updating typeRef or pinning announcement:', error);
    } finally {
      this.currentAnnouncement = null; // Hide the selector after updating
    }
  }

  async unpinAnnouncement(title: string) {
    const sourcePath = `non-validated-post/${title}`;
    const destinationPath = `validated-posts/${title}`;

    // Reference to source document
    const sourceDocRef = doc(this.firestore, sourcePath);

    // Reference to destination document
    const destinationDocRef = doc(this.firestore, destinationPath);

    try {
      // Copy document data
      await this.copyDocument(sourceDocRef, destinationDocRef);

      // Update status
      await setDoc(sourceDocRef, { pastActivity: false }, { merge: true });
      await setDoc(destinationDocRef, { pastActivity: false }, { merge: true });

    } catch (error) {
      console.error('Error processing document:', error);
    }
  }

  async onImageUpload(event: Event, title: string): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const files: FileList = input.files;
      const fileArray: File[] = Array.from(files);

      for (const file of fileArray) {
        try {
          const storage = getStorage(); // Get the default Firebase Storage instance
          const filePath = `posts/past-activities/${title}/${file.name}`;
          const storageRef = ref(storage, filePath); // Set the file path in storage

          // Upload the file to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file);
          console.log('Uploaded a file!', snapshot);

          // Get the download URL after upload
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('File available at', downloadURL);

          // Save the storage path (file reference) to Firestore
          const destinationPath = `validated-posts/${title}`;
          console.log('Destination Path:', destinationPath);
          const destinationDocRef = doc(this.firestore, destinationPath);

          // Update Firestore with the file path
          const folderPath = `posts/past-activities/${title}`;
          await setDoc(destinationDocRef, { imagesRef: folderPath }, { merge: true });
          console.log('Document successfully updated with file path');

        } catch (error) {
          console.error('Error uploading file or updating document:', error);
        }
      }
    }
  }
}
