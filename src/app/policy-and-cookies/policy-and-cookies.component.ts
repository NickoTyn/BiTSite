import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-policy-and-cookies',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './policy-and-cookies.component.html',
  styleUrl: './policy-and-cookies.component.css'
})
export class PolicyAndCookiesComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment: string | null) => {
      if (fragment) {
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });
  }

  scrollToSection(section: string): void {
    this.viewportScroller.scrollToAnchor(section);
  }
}