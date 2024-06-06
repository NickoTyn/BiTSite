import { Component } from '@angular/core';
import { PostValidationComponent } from '../post-validation/post-validation.component';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { AdditionalQuestionComponent } from '../additional-question/additional-question.component';

@Component({
  selector: 'app-post-validation-hub',
  standalone: true,
  imports: [
    PostValidationComponent,
    MatDialogModule,
    AdditionalQuestionComponent
  ],
  templateUrl: './post-validation-hub.component.html',
  styleUrl: './post-validation-hub.component.css'
})
export class PostValidationHubComponent {

constructor(public dialog: MatDialog){}

  announcements = [
    { id: 1, title: 'Dummy Announcement', content: 'This is a dummy announcement content for testing purposes. The actual announcements will be dynamically loaded here.', date: '2024-06-06' },
    { id: 2, title: 'Announcement 2', content: 'Content for announcement 2', date: '2024-06-02' },
    // Add more announcements here
  ];


  approveAnnouncement(id: number) {
    // Implement approval logic here
    console.log('Approved announcement with ID:', id);
  }

  rejectAnnouncement(id: number) {
    // Implement rejection logic here
    console.log('Rejected announcement with ID:', id);
  }


  openDialog(): void {
    this.dialog.open(PostValidationComponent, {
    });
  }

  openAdditionalQuestionDialog(): void {
    this.dialog.open(AdditionalQuestionComponent, {
    });
  }

}
