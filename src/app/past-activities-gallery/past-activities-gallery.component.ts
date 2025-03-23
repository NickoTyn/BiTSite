import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { Firestore, doc, getDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Timestamp } from '@firebase/firestore'; // Ensure you import the Timestamp type
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-past-activities-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './past-activities-gallery.component.html',
  styleUrls: ['./past-activities-gallery.component.css']
})
export class PastActivitiesGalleryComponent implements OnInit {
  imageUrls: { url: string, aspectRatio: number }[] = [];
  private storage = getStorage();
  galleryRef: string | null = null;
  firestore: Firestore;
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
    typeRef: '/past-activities-gallery',
  };

  constructor(private router: Router, private route: ActivatedRoute, firestore: Firestore) {
    this.firestore = firestore;
  }

  async ngOnInit() {
    // Try to get the announcement from navigation state.
    const navState = this.router.getCurrentNavigation()?.extras.state as { announcement: Announcement };
    if (navState && navState.announcement) {
      this.announcement = navState.announcement;
      console.log('Using announcement from state:', this.announcement);
      this.loadImagesFromAnnouncement();
    } else {
      // Fallback: Retrieve the date parameter from the URL and query Firestore.
      this.route.paramMap.subscribe(async params => {
        const dateParam = params.get('date');
        console.log('Date parameter from URL:', dateParam);
        if (dateParam) {
          const millis = Number(dateParam);
          const ts = Timestamp.fromMillis(millis);
          // Query Firestore for a document where the 'date' field equals the Timestamp.
          const colRef = collection(this.firestore, 'validated-posts');
          const q = query(colRef, where('date', '==', ts));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            this.announcement = {
              title: docSnap.data()['title'] || docSnap.id,
              ...docSnap.data()
            } as Announcement;
            console.log('Fetched announcement by date:', this.announcement);
            this.loadImagesFromAnnouncement();
          } else {
            console.error('No announcement found with date:', ts);
          }
        } else {
          console.error('No date parameter provided in URL.');
        }
      });
    }
  }

  loadImagesFromAnnouncement() {
    if (this.announcement && this.announcement.imagesRef) {
      this.galleryRef = this.announcement.imagesRef;
      this.getAllImagesFromFolder(this.galleryRef);
    } else {
      console.error('No gallery reference found in announcement.');
    }
  }

  async getAllImagesFromFolder(folderPath: string): Promise<void> {
    try {
      const folderRef = ref(this.storage, folderPath);
      const result = await listAll(folderRef);
      this.imageUrls = [];
      for (const itemRef of result.items) {
        const downloadURL = await getDownloadURL(itemRef);
        const { aspectRatio } = await this.getAspectRatio(downloadURL);
        this.imageUrls.push({ url: downloadURL, aspectRatio });
      }
      console.log('All image URLs with aspect ratios:', this.imageUrls);
    } catch (error) {
      console.error('Error retrieving images from folder:', error);
    }
  }

  async getAspectRatio(url: string): Promise<{ aspectRatio: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        resolve({ aspectRatio });
      };
      img.onerror = (error) => reject(error);
    });
  }
}
