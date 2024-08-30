import { Component, Inject, inject } from '@angular/core';
import { collection, doc, Firestore, getDocs, writeBatch } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-additional-question',
  standalone: true,
  imports: [],
  templateUrl: './additional-question.component.html',
  styleUrl: './additional-question.component.css'
})
export class AdditionalQuestionComponent {

  titleContent: string = '';

  private firestore: Firestore = inject(Firestore);

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; description: string; imageUrl: string}
  ) {
    this.titleContent = data.title;
  }

  async showConfirmation(){
     // Reference to the document 'non-validated-post-id' in the collection 'non-validated-post'
  const docRef = doc(this.firestore, 'non-validated-post/YUVQgiBG57gEiOPk1YVx');
  
  // Reference to the subcollection
  const subcollectionRef = collection(docRef, this.titleContent);

  try {
    // Fetch all documents in the subcollection
    const querySnapshot = await getDocs(subcollectionRef);

    // Batch delete each document
    const batch = writeBatch(this.firestore);
    querySnapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // Commit the batch
    await batch.commit();
    console.log('Successfully deleted all documents in the subcollection.');

  } catch (error) {
    console.error('Error deleting announcement:', error);
  }

  // Optionally, close the dialog after rejection
  }
}
