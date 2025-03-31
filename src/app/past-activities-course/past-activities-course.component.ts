import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { Firestore, collection, doc, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { Timestamp } from '@firebase/firestore';

export interface Video {
  title: string;
  link: string;
}

interface Class {
  title: string;
  date: string;          // Formatted date (dd/mm/yyyy)
  originalDate: string;  // Original date string for sorting
  description: string;
  filesRef: string | undefined;
  videos: Array<{ title: string; link: string }>;
}

@Component({
  selector: 'app-past-activities-course',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './past-activities-course.component.html',
  styleUrls: ['./past-activities-course.component.css']
})
export class PastActivitiesCourseComponent implements OnInit, Class {
  // Announcement data for the course (cover image, title, etc.)
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
    typeRef: '/past-activities-course'
  };

  // We'll use the date (milliseconds string) from the URL as fallback
  announcementDate: string | null = null;
  
  // Class properties
  title: string = 'Classes for Past Activities';
  date: string = '';
  description: string = 'Courses available for viewing';
  filesRef: string = 'File Ref';
  originalDate: string = '';
  videos: Video[] = [];
  classes: Class[] = [];

  isAdminUser: boolean = false;
  isFormVisible: boolean = false;
  selectedFile: File | null = null;
  downloadURLs: string[] = [];
  
  userRank: string | null = null;
  private userRankSubscription: Subscription | undefined;
  
  private firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  private datePipe: DatePipe = inject(DatePipe);

  constructor(private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    // Initialize the date property
    this.date = this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';

    // First, try to get the announcement from navigation state.
    const navState = this.router.getCurrentNavigation()?.extras.state as { announcement: Announcement };
    if (navState && navState.announcement) {
      this.announcement = navState.announcement;
      console.log('Using announcement from state:', this.announcement);
    } else {
      // Fallback: Retrieve the 'date' parameter from the URL.
      this.announcementDate = this.route.snapshot.paramMap.get('date');
      console.log('Announcement date from URL:', this.announcementDate);
      if (this.announcementDate) {
        const millis = Number(this.announcementDate);
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
        } else {
          console.error('No announcement found with date:', ts);
        }
      } else {
        console.error('No announcement state or date parameter provided.');
      }
    }
    
    // Set the current date (for display if needed)
    this.date = this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';
    
    // Fetch classes for the course based on the announcement.
    await this.fetchClasses();
    
    // Check admin privileges.
    this.isAdminUser = await this.isAdmin();
  }

  async isAdmin(): Promise<boolean> {
    const userRank = await this.authService.getUserRank();
    console.log('USER RANK', userRank);
    return userRank === 'admin';
  }

  isQueueNull(): boolean {
    return !this.classes || this.classes.length === 0;
  }

  addNewClass(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  triggerFileUpload(): void {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  }

  async fetchClasses(): Promise<void> {
    try {
      // Use the announcement title (if available) to build the collection path.
      const collectionPath = `courses/${this.announcement?.title || 'default-title'}/classes`;
      console.log('Fetching classes from:', collectionPath);
      const colRef = collection(this.firestore, collectionPath);
      const q = query(colRef);
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log('No classes found.');
        this.classes = [];
        return;
      }
      const fetchedClasses = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          title: data['className'] || docSnap.id,
          date: this.formatDate(data['date'] || ''),
          originalDate: data['date'] || '',
          description: data['classDescription'] || '',
          filesRef: data['filesRef'],
          videos: data['videoLink'] ? [{ title: 'Video', link: data['videoLink'] }] : []
        } as Class;
      });
      // Sort classes with latest dates first.
      this.classes = fetchedClasses.sort((a, b) => {
        const dateA = new Date(a.originalDate);
        const dateB = new Date(b.originalDate);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
      console.log('Fetched classes:', this.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  }

  async onSubmit(formValue: any): Promise<void> {
    console.log('Form submitted:', formValue);
    if (this.selectedFile) {
      await this.uploadFile(formValue.className);
    }
    await this.saveFormData(formValue);
    this.isFormVisible = false;
  }

  async uploadFile(className: string): Promise<void> {
    if (!this.selectedFile) return;
    const storage = getStorage();
    const filePath = `/courses/${className}/${this.selectedFile.name}`;
    const storageRef = ref(storage, filePath);
    try {
      const snapshot = await uploadBytes(storageRef, this.selectedFile);
      console.log('File uploaded:', snapshot);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at:', downloadURL);
      this.downloadURLs.push(downloadURL);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  async saveFormData(formValue: any): Promise<void> {
    const destinationPath = `/courses/${this.announcement?.title}/classes/${formValue.className}`;
    const destinationDocRef = doc(this.firestore, destinationPath);
    const dataToSave = { 
      className: formValue.className,
      classDescription: formValue.classDescription,
      videoLink: formValue.videoLink,
      filesRef: this.downloadURLs.length > 0 ? this.downloadURLs : 'none',
      date: new Date().toISOString()
    };
    try {
      await setDoc(destinationDocRef, dataToSave, { merge: true });
      console.log('Document successfully updated with form data and file paths');
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }

  async downloadFiles(filesRef: string | undefined): Promise<void> {
    if (!filesRef || filesRef === 'none') {
      console.error('No files available for download.');
      return;
    }
  
    const fileUrls = Array.isArray(filesRef)
      ? filesRef
      : typeof filesRef === 'string'
        ? filesRef.split(',').map(url => url.trim())
        : [];
  
    console.log('Files to download:', fileUrls);
  
    fileUrls.forEach(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  

  loadMoreClasses(): void {
    // Implement logic to load more classes if needed.
  }

  getVideoUrl(link: string): SafeResourceUrl {
    const videoId = this.extractVideoId(link);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  extractVideoId(link: string): string {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regExp);
    return match ? match[1] : '';
  }
}
