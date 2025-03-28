import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
export class SessionChoiceComponent implements AfterViewInit {

  @ViewChild('groupEl') groupElRef!: ElementRef;
  @ViewChild('soloCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('soloEl') soloElRef!: ElementRef<HTMLDivElement>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog // Angular Material Dialog
  ) {}


  ngAfterViewInit() {

    console.log('Canvas component initialized!');

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.fillStyle = 'limegreen';
    ctx.fillRect(100, 100, 200, 200); // Simple test block
  }
  
  

  onGroupMove(event: MouseEvent) {
    const groupEl = this.groupElRef.nativeElement;
    const rect = groupEl.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
  
    groupEl.style.setProperty('--posX', `${x}px`);
    groupEl.style.setProperty('--posY', `${y}px`);
  }

  resetGroupPosition() {
    const groupEl = this.groupElRef.nativeElement;
    groupEl.style.setProperty('--posX', `0px`);
    groupEl.style.setProperty('--posY', `0px`);
  }
  
  

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
