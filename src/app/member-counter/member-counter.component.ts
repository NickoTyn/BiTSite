import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-member-counter',
  standalone: true,
  templateUrl: './member-counter.component.html',
  styleUrls: ['./member-counter.component.css']
})
export class MemberCounterComponent implements OnInit {
  private channelId: string = 'UC-lHJZR3Gqxm24_Vd_AJ5Yw';
  private apiKey: string = 'AIzaSyB361OxFYjoOALzvY-IOVBPtpTsVKFEUz8'; // Use your own API key
  private apiResponse: string = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${this.channelId}&key=${this.apiKey}`;
  public subCount: number = 1062;

  constructor() {}

  ngOnInit(): void {
    this.updateCounter();
    setInterval(() => {
      this.updateCounter();
    }, 2000);
  }

  private updateCounter(): void {
    fetch(this.apiResponse)
      .then(response => response.json())
      .then(data => {
        this.subCount = 1062; // You should replace this with actual data from the API response
      })
      .catch(error => console.error('Error fetching data:', error));
  }
}
