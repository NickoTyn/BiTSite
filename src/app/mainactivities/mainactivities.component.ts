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

    defaultImageUrl: string = 'path/to/default/image.jpg'; // Make sure to define your default image URL

    private firestore: Firestore = inject(Firestore);

    constructor() {

        this.slides = document.getElementsByClassName("carousel-item");
    }

    ngOnInit() {
        this.fetchAnnouncements();
    }

async fetchAnnouncements() {
    try {
        // Reference to the specific document in the 'non-validated-post' collection
        const docRef = doc(this.firestore, 'validated-posts/qS8Y1Iwky1k3MxKXQJNe');
        const docSnap = await getDoc(docRef);

        // Check if the document exists
        if (!docSnap.exists()) {
            console.log('Document with ID non-validated-post-id does not exist.');
            this.queue = [];
            return;
        }


        const subcollections = [
            "New Post", "Acum este momentul tau!", "This is a new Post",
            "Sansa ta de Halloween!", "Deschidem porțile unui nou univers Minecraft!",
            "♟Creează un joc de șah!♟", "Seară de jocuri!🎮"
        ];

        for (const title of subcollections) {
            if (this.queue.length >= 6) {
                break;
            }

            // Reference to the subcollection
            const subcollectionRef = collection(this.firestore, `validated-posts/qS8Y1Iwky1k3MxKXQJNe/${title}`);
            const subcollectionDocs = await getDocs(subcollectionRef);

            subcollectionDocs.forEach(doc => {
                if (this.queue.length >= 6) {
                    return;
                }

                const data = doc.data() as Omit<Announcement, 'title'>;
                this.queue.push({
                    title,
                    ...data
                });
            });
        }

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



