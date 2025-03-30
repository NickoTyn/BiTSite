import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      alert('🔒 Această pagină nu este disponibilă pe ecrane mici.');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
