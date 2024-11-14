import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discord',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discord.component.html',
  styleUrls: ['./discord.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
})
export class DiscordComponent implements OnInit {
  totalMembers: number = 0;
  onlineMembers: number = 0;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.getDiscordServerStats();
  }



  getDiscordServerStats(): void {
    // Mocking Discord server stats
    this.totalMembers = 200;  
    this.onlineMembers = 50;
  }

  onButtonClick(event: Event): void {
    event.preventDefault();

    // Access the SVG element within the button
    const svgElement = (event.target as HTMLElement).closest('button')?.querySelector('svg');

    if (svgElement) {
      // Add the spinning animation class
      this.renderer.addClass(svgElement, 'spin-animation');

      // Wait for the animation to finish before redirecting
      setTimeout(() => {
        window.location.href = 'https://discord.gg/ptVamcnrRm'; // Replace with your desired link
      }, 1000); // Match with the duration of the animation (1 second)
    }
  }
}
