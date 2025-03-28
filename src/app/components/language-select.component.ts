import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-language-select',
  imports: [CommonModule],
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.css'],
})
export class LanguageSelectComponent implements OnInit, AfterViewInit {
  mode: 'solo' | 'group' = 'solo';
  sessionId: string | null = null;
  languages: any[] = [];

  readonly basicLanguages = [
    'python',
    'javascript',
    'typescript',
    'java',
    'c',
    'c++',
    'cpp',
    'csharp',
    'ruby',
    'php',
    'swift',
    'kotlin',
    'rust'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.mode = (params.get('mode') as 'solo' | 'group') || 'solo';
      this.sessionId = params.get('sessionId');
    });

    this.http.get<any[]>('https://emkc.org/api/v2/piston/runtimes').subscribe(data => {
      this.languages = data
        .filter(lang => this.basicLanguages.includes(lang.language.toLowerCase()))
        .sort((a, b) => a.language.localeCompare(b.language));
    });
  }

  selectLanguage(lang: string, version: string) {
    const queryParams: any = {
      lang,
      version,
      mode: this.mode,
    };

    if (this.sessionId) {
      queryParams.sessionId = this.sessionId;
    }

    this.router.navigate(['/editor'], { queryParams });
  }

  ngAfterViewInit() {
    this.initAnimatedBackground();
  }

  private initAnimatedBackground() {
    const canvas = document.getElementById('demo-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let points: any[] = [];
    let target = { x: width / 2, y: height / 2 };
    let animateHeader = true;

    canvas.width = width;
    canvas.height = height;

    // Create points
    for (let x = 0; x < width; x += width / 20) {
      for (let y = 0; y < height; y += height / 20) {
        let px = x + Math.random() * width / 20;
        let py = y + Math.random() * height / 20;
        let p = { x: px, originX: px, y: py, originY: py, closest: [], circle: null, active: 0 };
        points.push(p);
      }
    }

    // Find closest neighbors
    for (let i = 0; i < points.length; i++) {
      let p1 = points[i];
      let closest: any[] = [];

      for (let j = 0; j < points.length; j++) {
        let p2 = points[j];
        if (p1 === p2) continue;
        let placed = false;

        for (let k = 0; k < 5; k++) {
          if (!placed) {
            if (!closest[k]) {
              closest[k] = p2;
              placed = true;
            }
          }
        }

        for (let k = 0; k < 5; k++) {
          if (!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
            closest[k] = p2;
            placed = true;
          }
        }
      }
      p1.closest = closest;
    }

    class Circle {
      pos: any;
      radius: number;
      color: string;
      active = 0;
    
      constructor(pos: any, rad: number, color: string) {
        this.pos = pos;
        this.radius = rad;
        this.color = color;
      }
    
      draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(156,217,249,${this.active})`;
        ctx.fill();
      }
    }
    
    // Then assign circles:
    for (let i in points) {
      let p = points[i];
      p.circle = new Circle(p, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
    }
    

    // Animation
    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        for (let i in points) {
          let p = points[i];
          let d = getDistance(target, p);
          p.active = d < 4000 ? 0.3 : d < 20000 ? 0.1 : d < 40000 ? 0.02 : 0;
          p.circle.active = p.active * 2;
          drawLines(p);
          p.circle.draw();
        }
      }
      requestAnimationFrame(animate);
    }

    function drawLines(p: any) {
      if (!p.active) return;
      for (let i in p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.closest[i].x, p.closest[i].y);
        ctx.strokeStyle = `rgba(156,217,249,${p.active})`;
        ctx.stroke();
      }
    }

    function shiftPoint(p: any) {
      const TweenLite = (window as any).TweenLite;
      const Circ = (window as any).Circ;

      if (!TweenLite || !Circ) return;

      TweenLite.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: () => shiftPoint(p),
      });
    }

    function getDistance(p1: any, p2: any) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // Mouse events
    window.addEventListener('mousemove', (e) => {
      target.x = e.pageX;
      target.y = e.pageY;
    });

    window.addEventListener('scroll', () => {
      animateHeader = window.scrollY <= height;
    });

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    for (let i in points) {
      shiftPoint(points[i]);
    }

    animate();
  }
}
