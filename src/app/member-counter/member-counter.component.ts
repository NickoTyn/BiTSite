import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-member-counter',
  standalone: true,
  templateUrl: './member-counter.component.html',
  styleUrls: ['./member-counter.component.css']
})
export class MemberCounterComponent implements OnInit {
  @ViewChild('counterElement', { static: true }) counterElement!: ElementRef;

  projectcount: number = 0;
  courses: number = 0;
  clientcount: number = 0;
  hourslogged_reffrence: number = 7500;
  customerfeedback: number = 0;

  projectcountstop: any;
  coursesstop: any;
  clientcountstop: any;
  customerfeedbackstop: any;

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.startCounting();
        observer.unobserve(this.counterElement.nativeElement); // Stop observing after the first trigger
      }
    }, { threshold: 0.5 }); // Trigger when 50% of the element is in view

    observer.observe(this.counterElement.nativeElement);
  }

  startCounting() {
    this.projectcountstop = setInterval(() => {
      this.projectcount++;
      if (this.projectcount === 46) {
        clearInterval(this.projectcountstop);
      }
    }, 10);

    this.coursesstop = setInterval(() => {
      this.courses++;
      if (this.courses === 95) {
        clearInterval(this.coursesstop);
      }
    }, 10);

    this.clientcountstop = setInterval(() => {
      this.clientcount += 27;
      if (this.clientcount >= this.hourslogged_reffrence) {
        this.clientcount = this.hourslogged_reffrence;
        clearInterval(this.clientcountstop);
      }
    }, 10);

    this.customerfeedbackstop = setInterval(() => {
      this.customerfeedback++;
      if (this.customerfeedback === 100) {
        clearInterval(this.customerfeedbackstop);
      }
    }, 10);
  }
}
