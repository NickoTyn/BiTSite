import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Firestore, collection, doc, getDocs, getDoc, setDoc, writeBatch, CollectionReference, DocumentData } from '@angular/fire/firestore';


@Component({
    selector: 'app-mainactivities',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mainactivities.component.html',
    styleUrl: './mainactivities.component.css'
})
export class MainactivitiesComponent {


    public slideIndex: number = 0;
    public slides: HTMLCollectionOf<Element>;
    public queue: Announcement[] = [];


    defaultImageUrl: string = 'backgroundAboutUs.png'; // Make sure to define your default image URL

    private firestore: Firestore = inject(Firestore);

    constructor() {

        this.slides = document.getElementsByClassName("carousel-item");
    }

    ngOnInit() {
        this.fetchAnnouncements();
        this.addThumbnailEventListeners();
    }

    async fetchAnnouncements() {
        try {
            // Reference to the 'validated-posts' collection
            const collectionRef = collection(this.firestore, 'validated-posts');
            const collectionSnapshot = await getDocs(collectionRef);
    
            // Check if the collection has documents
            if (collectionSnapshot.empty) {
                console.log('No documents found in the validated-posts collection.');
                this.queue = [];
                return;
            }
    
            // Iterate over the documents and add them to the queue
            this.queue = []; // Clear the queue before adding new data
            collectionSnapshot.forEach(doc => {
                if (this.queue.length >= 6) {
                    return; // Stop adding more if queue already has 6 items
                }
    
                const data = doc.data() as Omit<Announcement, 'title'>; // Assuming `Announcement` type
    
                // Check if the status is 'active' before adding to the queue
                if (data.status === 'approved') {
                    this.queue.push({
                        title: doc.id, // Assuming the document ID or a specific field should be used as title
                        ...data
                    });
                }
            });
    
            // Log the fetched data DE STERS AT LAUNCH
            console.log('Fetched Announcements:', this.queue);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    }
    
    
    


    public moveSlide(n: number): void {
        this.slideIndex += n;
        if (this.slideIndex >= this.queue.length) this.slideIndex = 0;
        if (this.slideIndex < 0) this.slideIndex = this.queue.length - 1;
        this.showSlides();
      }

    private showSlides(): void {
        const slides = document.querySelectorAll('.carousel__slide');
        slides.forEach((slide, index) => {
          (slide as HTMLElement).style.display = index === this.slideIndex ? 'block' : 'none';
        });
      }

     public setSlide(index: number): void {
    this.slideIndex = index;
    this.showSlides();
  }

  private addThumbnailEventListeners() {
    const thumbnails = document.querySelectorAll('.carousel__thumbnails img');

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', () => {
            thumbnails.forEach(img => img.classList.remove('selected')); // Deselect all
            (thumbnail as HTMLImageElement).classList.add('selected'); // Select clicked
        });
    });
}
  
}



document.addEventListener('DOMContentLoaded', (event) => {
    const postWrappers = document.querySelectorAll('.post_wrapper');
    const poza = document.querySelector('.poza') as HTMLElement;
    const scrisElements = document.querySelectorAll('.titleDescriptionCompany') as NodeListOf<HTMLElement>;

    postWrappers.forEach((postWrapper) => {
        postWrapper.addEventListener('mouseover', () => {
            poza.style.opacity = '0.1';
            poza.style.filter = 'blur(1px)';
            scrisElements.forEach((scris) => {
                scris.style.opacity = '100%';
            });
        });

        postWrapper.addEventListener('mouseout', () => {
            poza.style.opacity = '1';
            poza.style.filter = 'blur(0)';
            scrisElements.forEach((scris) => {
                scris.style.opacity = '0%';
            });
        });
    });
});



