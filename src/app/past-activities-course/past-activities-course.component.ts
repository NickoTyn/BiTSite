import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { Firestore, collection, doc, getDocs, query, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms'; 
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from '../auth.service';

export interface Video {
  title: string;
  link: string;
}

interface Class {
  title: string;
  date: string;          // Formatted date (dd/mm/yyyy)
  originalDate: string;  // Original date string for sorting
  description: string;
  filesRef: string | undefined; // Adjust type according to your use case
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
export class PastActivitiesCourseComponent implements Class, OnInit {
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

  // Implementing the Class properties
  title: string = 'Classes for Past Activities'; // You can adjust this title
  date: string = this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';
  description: string = 'Courses available for viewing';
  filesRef: string = 'File Ref';
  originalDate: string = '';
  videos: Video[] = [];

  classes: Class[] = [];

  /* classes: Class[] = [
    {
      title: 'Class 1: Introduction',
      date: this.datePipe.transform(new Date(2023, 9, 1), 'dd/MM/yyyy') || '',
      description: 'Photoshop Mastery: Comprehensive Course for Beginners to Advanced',
      videos: [
        { title: 'Introduction Video', link: 'https://www.youtube.com/watch?v=j2cgfVHCsGQ&ab_channel=PiXimperfect' }
      ]
    },
    {
      title: 'Class 2: Advanced Topics',
      date: this.datePipe.transform(new Date(2023, 9, 1), 'dd/MM/yyyy') || '',
      description: 'In this class, we dive into advanced topics.',
      videos: []
    }
  ]; */

  authService = inject(AuthService);

  private firestore: Firestore = inject(Firestore);
  public classesQueue: Class[] = []; // Initialize as an empty array
  isFormVisible = false;  
  selectedFile: File | null = null;
  downloadURLs: string[] = [];  

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private datePipe: DatePipe) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      const state = history.state as { galleryRef: string; announcement: Announcement };
      // Additional initialization logic here, if needed
    });

    this.fetchClasses();
  }

  isQueueNull() {
    return !this.classesQueue || this.classesQueue.length === 0;
  }

  addNewClass() {
    this.isFormVisible = !this.isFormVisible;
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click();
  }

   formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Return an empty string if the date is invalid

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(date.getFullYear()); // Get last two digits of the year
    return `${day}/${month}/${year}`; // Return formatted date
  };

  async fetchClasses() {
    try {
      // Reference to the 'classes' collection
      const collectionRef = collection(this.firestore, 'courses/Default Title/classes');
      const querySnapshot = await getDocs(query(collectionRef)); // Get all documents
  
      if (querySnapshot.empty) {
        console.log('No classes found.');
        this.classes = []; // Initialize as an empty array
        return;
      }
  
      // Function to format date in dd/mm/yyyy format
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Return an empty string if the date is invalid
  
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = String(date.getFullYear()); // Get full year
        return `${day}/${month}/${year}`; // Return formatted date without time
      };
  
      // Loop through each document and populate the classes array
      const fetchedClasses = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          title: data['className'] || docSnap.id, // Use a className field or the document ID
          date: formatDate(data['date'] || ''), // Format the date for display
          originalDate: data['date'] || '', // Store the original date for sorting
          description: data['classDescription'] || '', // Ensure there's a description field
          filesRef: data['filesRef'],
          videos: data['videoLink'] ? [{ title: 'Video', link: data['videoLink'] }] : [] // Wrap videoLink in an array
        } as Class;
      });
  
      // Sort the classes in non-chronological order (latest dates first)
      this.classes = fetchedClasses.sort((a, b) => {
        // Parse the original dates for sorting
        const dateA = new Date(a.originalDate);
        const dateB = new Date(b.originalDate);
  
        // Check for invalid dates and handle them
        if (isNaN(dateA.getTime())) return 1; // Invalid date A, push it to the end
        if (isNaN(dateB.getTime())) return -1; // Invalid date B, push it to the end
  
        // Sort in descending order (latest dates first)
        return dateB.getTime() - dateA.getTime(); // Change order for descending sort
      });
  
      // Log the fetched data
      console.log('Fetched classes:', this.classes);
  
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }
  
  
  
  
  
  
  


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  }

  async onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    if (this.selectedFile) {
      await this.uploadFile(formValue.className);
    }
    await this.saveFormData(formValue);
    this.isFormVisible = false;  
  }

  async uploadFile(title: string) {
    if (!this.selectedFile) return;

    const storage = getStorage();
    const filePath = `/courses/${title}/${this.selectedFile.name}`;
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

  async saveFormData(formValue: any) {
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

  async downloadFiles() {
    // Ensure filesRef is not empty
    if (!this.filesRef || this.filesRef === 'none') {
      console.error('No files available for download.');
      return;
    }
  
    // Split filesRef to get individual URLs
    const fileUrls = this.filesRef.split(',').map(url => url.trim()); // Ensure we trim whitespace
  
    console.log('Files to download:', fileUrls); // Log the URLs for debugging
  
    // Trigger download for each file URL
    fileUrls.forEach(url => {
      const a = document.createElement('a');
      a.href = url; // Use the URL directly
      a.download = url.split('/').pop() || 'download'; // Extract the file name from the URL
      document.body.appendChild(a);
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up the anchor element
    });
  }
  
  

  loadMoreClasses() {
    // Logic to load more classes
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
