import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-member-counter',
  standalone: true,
  templateUrl: './member-counter.component.html',
  styleUrls: ['./member-counter.component.css']
})
export class MemberCounterComponent implements OnInit {
  @ViewChild('counterElement', { static: true }) counterElement!: ElementRef;

  // Displayed counters
  projectcount: number = 0;
  courses: number = 0;
  clientcount: number = 0;
  customerfeedback: number = 0;

  // Target values calculated from elapsed time
  targetProjectCount: number = 0;
  targetCourses: number = 0;
  targetClientCount: number = 0;
  targetFeedback: number = 0;

  // Fixed starting date
  baseDate = new Date('2024-01-01');

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.calculateTargetCounts();
        this.animateCounts();
        observer.unobserve(this.counterElement.nativeElement);
      }
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -300px 0px'
    });

    observer.observe(this.counterElement.nativeElement);
  }

  calculateTargetCounts() {
    const now = Date.now();
    const start = this.baseDate.getTime();
    const elapsedMs = now - start;
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24); // Convert to days

    this.targetProjectCount = Math.floor(10 + elapsedDays * 0.05);         // Grows ~0.05/day
    this.targetCourses = Math.floor(30 + elapsedDays * 0.08);              // Grows ~0.08/day
    this.targetClientCount = Math.floor(500 + elapsedDays * 5);            // Grows ~5/day
    this.targetFeedback = Math.min(100, Math.floor(elapsedDays * 0.1));    // Max 100
  }

  animateCounts() {
    const duration = 2000; // Animation duration in ms
    const startTime = Date.now();

    const update = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      this.projectcount = Math.floor(this.targetProjectCount * progress);
      this.courses = Math.floor(this.targetCourses * progress);
      this.clientcount = Math.floor(this.targetClientCount * progress);
      this.customerfeedback = Math.floor(this.targetFeedback * progress);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Set exact final values
        this.projectcount = this.targetProjectCount;
        this.courses = this.targetCourses;
        this.clientcount = this.targetClientCount;
        this.customerfeedback = this.targetFeedback;
      }
    };

    requestAnimationFrame(update);
  }
}
