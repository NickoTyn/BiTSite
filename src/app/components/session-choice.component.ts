import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  standalone: true,
  selector: 'app-session-choice',
  templateUrl: './session-choice.component.html',
  styleUrls: ['./session-choice.component.css'],
})
export class SessionChoiceComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog // Angular Material Dialog
  ) {}

  startSolo() {
    this.router.navigate(['/language'], { queryParams: { mode: 'solo' } });
  }

  
  startGroupSession() {
    if (!this.authService.isUserSignedIn()) {
      this.dialog.open(DialogBoxComponent, {
      });
      return;
    }
  
    const sessionId = this.generateSessionId();
    this.router.navigate(['/language'], {
      queryParams: { mode: 'group', sessionId }
    });
  }
  
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
  
}
