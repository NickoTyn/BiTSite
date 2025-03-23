import { Component, inject, OnInit, Renderer2, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';

@Component({
  selector: 'app-past-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './past-activities.component.html',
  styleUrls: ['./past-activities.component.css']
})
export class PastActivitiesComponent implements OnInit, AfterViewInit {

  private firestore: Firestore = inject(Firestore);
  announcements: Announcement[] = [];

  // Use ViewChildren to get a reference to all slide elements
  @ViewChildren('slide') slideElements!: QueryList<ElementRef>;

  constructor(public dialog: MatDialog, private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
    this.fetchAnnouncements();
  }

  async fetchAnnouncements() {
    try {
      const collectionRef = collection(this.firestore, 'validated-posts');
      const queryRef = query(collectionRef, where('pastActivity', '==', true));
      const querySnapshot = await getDocs(queryRef);

      if (querySnapshot.empty) {
        console.log('No documents with status "past-activities" found.');
        this.announcements = [];
        return;
      }

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as Omit<Announcement, 'title'>;
        this.announcements.push({
          title: docSnap.id,
          ...data
        });
      }

      this.announcements = this.sortAnnouncementsByDate(this.announcements);
      console.log('Fetched announcements:', this.announcements);

    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  sortAnnouncementsByDate(announcements: any[]) {
    return announcements.sort((a, b) => {
      const dateA = a.date ? a.date.toDate() : 0;
      const dateB = b.date ? b.date.toDate() : 0;
      return dateB - dateA;
    });
  }

  ngAfterViewInit() {
    const options = {
      root: null,
      // Define a center region: when the element enters the middle 50% of the viewport, trigger the observer
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0  // Trigger as soon as any part enters the center region
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'active');
        } else {
          this.renderer.removeClass(entry.target, 'active');
        }
      });
    }, options);
  
    // In case the slides are loaded after view initialization, subscribe to changes
    this.slideElements.changes.subscribe((slides: QueryList<ElementRef>) => {
      slides.forEach(slide => observer.observe(slide.nativeElement));
    });
  
    // Observe the initially rendered slides
    this.slideElements.forEach((slide: ElementRef) => observer.observe(slide.nativeElement));
  }
  
  onPostWrapperClick(event: Event, redirectUrl: string, announcement: Announcement) {
    const target = event.currentTarget as HTMLElement;
    this.renderer.addClass(target, 'active');
  
    setTimeout(() => {
      // Check if announcement.date has a toDate function (Firestore Timestamp) or is a Date
      let dateValue: string;
      if (announcement.date && typeof (announcement.date as any).toDate === 'function') {
        dateValue = (announcement.date as any).toDate().getTime().toString();
      } else if (announcement.date instanceof Date) {
        dateValue = announcement.date.getTime().toString();
      } else {
        dateValue = announcement.date; // fallback if it's already a string
      }
      this.router.navigate([`/${redirectUrl}`, dateValue], { state: { announcement } });
    }, 2350);
  }
  

}
