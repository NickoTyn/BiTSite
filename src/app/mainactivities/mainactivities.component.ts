import { Component } from '@angular/core';

@Component({
  selector: 'app-mainactivities',
  standalone: true,
  imports: [],
  templateUrl: './mainactivities.component.html',
  styleUrl: './mainactivities.component.css'
})
export class MainactivitiesComponent {

  private slideIndex: number = 0;
  private slides: HTMLCollectionOf<Element>;

  constructor() {
      this.slides = document.getElementsByClassName("carousel-item");
      this.showSlides(this.slideIndex);

      // Optional: Auto move slides
      setInterval(() => {
          this.moveSlide(1);
      }, 3000); // Change image every 3 seconds
  }

  public moveSlide(n: number): void {
      this.showSlides(this.slideIndex += n);
  }

  private showSlides(n: number): void {
      if (n >= this.slides.length) this.slideIndex = 0;
      if (n < 0) this.slideIndex = this.slides.length - 1;

      Array.from(this.slides).forEach((slide: Element, index: number) => {
          (slide as HTMLElement).style.transform = `translateX(-${this.slideIndex * 100}%)`;
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const carousel = new MainactivitiesComponent();
  document.querySelector(".prev")!.addEventListener("click", () => carousel.moveSlide(-1));
  document.querySelector(".next")!.addEventListener("click", () => carousel.moveSlide(1));
  
});

