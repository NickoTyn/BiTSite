import { Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, setDoc, writeBatch, CollectionReference, DocumentData } from '@angular/fire/firestore';
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

  constructor(public dialog: MatDialog) { }

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
      const subcollections = ["New Post", "Acum este momentul tau!", "This is a new Post", "Sansa ta de Halloween!", "Deschidem porțile unui nou univers Minecraft!", "♟Creează un joc de șah!♟", "Seară de jocuri!🎮"]; 

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

  async approveAnnouncement(title: string) {
    console.log('Approved announcement with title:', title);


    const sourcePath = `non-validated-post/YUVQgiBG57gEiOPk1YVx/${title}`;
    const destinationPath = `validated-posts/qS8Y1Iwky1k3MxKXQJNe/${title}`;

    // Reference to source collection
    const sourceCollectionRef = collection(this.firestore, sourcePath);

    // Reference to destination collection
    const destinationCollectionRef = collection(this.firestore, destinationPath);

    this.copyCollection(sourceCollectionRef, destinationCollectionRef)
      .then(() => {
        console.log('Collection successfully copied to', destinationPath);
      })
      .catch(error => {
        console.error('Error copying collection:', error);
      });

    const statusRef = doc(this.firestore, sourcePath);
    await setDoc(statusRef, { status: 'Approved' });
  }

  async copyCollection(sourceCollectionRef: CollectionReference<DocumentData>, destinationCollectionRef: CollectionReference<DocumentData>) {
    const batch = writeBatch(this.firestore);

    // Get all documents from the source collection
    const querySnapshot = await getDocs(sourceCollectionRef);

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data(); // Use docSnap.data() to get the document data
      const destinationDocRef = doc(destinationCollectionRef, docSnap.id); // Use docSnap.id to get the document ID

      // Set document in the destination collection
      batch.set(destinationDocRef, data);
    });

    // Commit the batch
    await batch.commit();
  }

  rejectAnnouncement(title: string) {
    this.dialog.open(AdditionalQuestionComponent, {
      data: {
        title,
      }
    });
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


}
