import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { addDoc, collection, collectionData, doc, Firestore, getDoc, setDoc, runTransaction } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-pumpkin-vote',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './pumpkin-vote.component.html',
  styleUrls: ['./pumpkin-vote.component.css']
})
export class PumpkinVoteComponent {
  voteForm: FormGroup;
  pumpkins: any[] = [];
  selectedPumpkins: string[] = [];
  newPumpkinName: string = '';
  newPumpkinImage: File | null = null; 
  isAdmin: boolean = false;
  identifier: string = ''; 

  private firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);

  constructor(private fb: FormBuilder) {
    this.voteForm = this.fb.group({});
  }

  async ngOnInit(): Promise<void> {
    await this.loadPumpkins();
    this.checkAdminRole();
    this.identifier = localStorage.getItem('voteIdentifier') || ''; // Check if user has voted
  }

  checkAdminRole() {
    const userRank = this.authService.getUserRank();
    this.isAdmin = userRank === 'admin';
  }

  async loadPumpkins() {
    collectionData(collection(this.firestore, 'pumpkins'), { idField: 'id' }).subscribe((data: any[]) => {
      this.pumpkins = data;
      console.log("Pumpkins loaded:", this.pumpkins); // Log to verify pumpkin data structure
    });
  }

  onPumpkinSelect(event: any) {
    const pumpkinId = event.target.value;
  
    if (!pumpkinId) {
      console.error("Pumpkin ID is undefined:", event);
      return;
    }
  
    if (event.target.checked) {
      if (this.selectedPumpkins.length < 2) {
        this.selectedPumpkins.push(pumpkinId);
      } else {
        event.target.checked = false; // Uncheck if limit is exceeded
        alert('You can only select up to 2 pumpkins.');
      }
    } else {
      // Remove pumpkin ID from selectedPumpkins if unchecked
      this.selectedPumpkins = this.selectedPumpkins.filter(id => id !== pumpkinId);
    }
  
    console.log("Selected pumpkins:", this.selectedPumpkins); // Log selected IDs for debugging
  }
  

  isPumpkinSelected(pumpkinId: string): boolean {
    return this.selectedPumpkins.includes(pumpkinId);
  }

  isEligibleToVote(): boolean {
    return this.selectedPumpkins.length <= 2;
  }

  async submitVote() {
    if (this.identifier) {
      alert("You've already voted. Each device can only vote once.");
      return;
    }
  
    const uniqueIdentifier = 'device_' + Math.random().toString(36).substr(2, 9);
    const voteRef = doc(collection(this.firestore, 'votes'), uniqueIdentifier);
  
    // Check if there are invalid pumpkin IDs
    if (this.selectedPumpkins.some((pumpkinId) => !pumpkinId)) {
      console.error("Invalid pumpkin ID in selectedPumpkins:", this.selectedPumpkins);
      alert("An error occurred with your selection. Please refresh the page and try again.");
      return;
    }
  
    try {
      // Start Firestore transaction
      await runTransaction(this.firestore, async (transaction) => {
        // First, check if the vote already exists
        const voteSnapshot = await transaction.get(voteRef);
        if (voteSnapshot.exists()) {
          throw new Error("You've already voted. Each device can only vote once.");
        }
  
        // Collect pumpkin document references and snapshots for selected pumpkins
        const pumpkinRefs = this.selectedPumpkins.map((pumpkinId) => doc(this.firestore, 'pumpkins', pumpkinId));
        const pumpkinSnapshots = await Promise.all(pumpkinRefs.map((ref) => transaction.get(ref)));
  
        // Prepare vote data
        const voteData = {
          pumpkins: this.selectedPumpkins,
          voteDate: new Date(),
        };
  
        // Set the vote record
        transaction.set(voteRef, voteData);
  
        // Update each selected pumpkin's vote count
        pumpkinSnapshots.forEach((pumpkinSnapshot, index) => {
          if (!pumpkinSnapshot.exists()) {
            throw new Error(`Pumpkin with ID ${this.selectedPumpkins[index]} does not exist.`);
          }
  
          const currentVoteCount = pumpkinSnapshot.data()['voteCount'] || 0;
          transaction.update(pumpkinRefs[index], { voteCount: currentVoteCount + 1 });
        });
      });
  
      // Set identifier in localStorage to prevent multiple votes
      localStorage.setItem('voteIdentifier', uniqueIdentifier);
      this.identifier = uniqueIdentifier;
  
      alert("Your vote has been submitted!");
      this.selectedPumpkins = [];
    } catch (error) {
      console.error("Error submitting vote: ", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to submit vote. Please try again.';
      alert(errorMessage);
    }
  }
  
  
  

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.newPumpkinImage = file;
    }
  }

  async addPumpkin() {
    if (!this.newPumpkinName || !this.newPumpkinImage) return;

    const storage = getStorage();
    const storageRef = ref(storage, `pumpkins/${this.newPumpkinImage.name}`);

    try {
      await uploadBytes(storageRef, this.newPumpkinImage);
      const imageUrl = await getDownloadURL(storageRef);

      const pumpkinData = {
        name: this.newPumpkinName,
        imageUrl: imageUrl,
        createdAt: new Date(),
        voteCount: 0 // Initialize with zero votes
      };

      await addDoc(collection(this.firestore, 'pumpkins'), pumpkinData);
      alert('Pumpkin added successfully!');
      this.newPumpkinName = ''; 
      this.newPumpkinImage = null; 
      await this.loadPumpkins();
    } catch (error) {
      console.error('Error adding pumpkin: ', error);
      alert('Failed to add pumpkin. Please try again.');
    }
  }
}
