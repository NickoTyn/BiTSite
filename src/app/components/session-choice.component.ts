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
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const soloDiv = this.soloElRef.nativeElement;

    let width = canvas.width = soloDiv.offsetWidth;
    let height = canvas.height = soloDiv.offsetHeight;

    let point = { x: width / 2, y: height / 2 };
    const particles: any[] = [];
    const { random, atan2, cos, sin, hypot } = Math;
    let hue = 0;
    const max = 200;

    function Particle() { }

    Particle.prototype = {
      init() {
        this.hue = hue;
        this.alpha = 0;
        this.size = this.random(1, 5);
        this.x = this.random(0, width);
        this.y = this.random(0, height);
        this.velocity = this.size * .05;
        this.changed = null;
        this.changedFrame = 0;
        this.maxChangedFrames = 50;
        return this;
      },
      draw() {
        //ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;// ALL COLORS

        // Cycle hue between 200–340 (blue to pink)
      this.hue = 200 + (hue % 140);
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
        this.update();
      },
      update() {
        if (this.changed) {
          this.alpha *= .92;
          this.size += 2;
          this.changedFrame++;
          if (this.changedFrame > this.maxChangedFrames) this.reset();
        } else if (this.distance(point.x, point.y) < 50) {
          this.changed = true;
        } else {
          const dx = point.x - this.x;
          const dy = point.y - this.y;
          const angle = atan2(dy, dx);
          this.alpha += .005;
          this.x += this.velocity * cos(angle);
          this.y += this.velocity * sin(angle);
          this.velocity += .002;
        }
      },
      reset() {
        this.init();
      },
      distance(x: number, y: number) {
        return hypot(x - this.x, y - this.y);
      },
      random(min: number, max: number) {
        return random() * (max - min) + min;
      }
    };

    function animate() {
      ctx.fillStyle = `rgba(0, 0, 0, .2)`;
      ctx.fillRect(0, 0, width, height);
      particles.forEach(p => p.draw());
      hue += 0.3;
      requestAnimationFrame(animate);
    }

    function touches(e: MouseEvent | TouchEvent) {
      const clientX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const rect = soloDiv.getBoundingClientRect();
      point.x = clientX - rect.left;
      point.y = clientY - rect.top;
    }

    // Init particles
    for (let i = 0; i < max; i++) {
      setTimeout(() => {
        const p = new (Particle as any)().init();
        particles.push(p);
      }, i * 10);
    }

    soloDiv.addEventListener('mousemove', touches);
    soloDiv.addEventListener('touchmove', touches);

    window.addEventListener('resize', () => {
      width = canvas.width = soloDiv.offsetWidth;
      height = canvas.height = soloDiv.offsetHeight;
      point = { x: width / 2, y: height / 2 };
    });

    animate();
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
