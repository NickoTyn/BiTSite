import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AccountComponent } from '../account/account.component';
import { Auth, User, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { ScrollService } from '../scrollService';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, AccountComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {



  username: string | null = null;
  auth: Auth;

  constructor(public dialog: MatDialog, private router: Router, private scrollService: ScrollService) {
    this.auth = getAuth();
  };


  authService = inject(AuthService);

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
      this.dialog.closeAll(); //closes the dialogbox after login/register
    })


    

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });



    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        // The user object has basic properties such as display name, email, etc.
        const displayName: string | null = user.displayName;


        this.username = displayName;

      } else {
        this.username = null;
      }
    });
  }


  onScrollToTarget(): void {
    this.router.navigate(['/home']).then(() => {
      this.scrollService.scrollToElement('join-us-form');
    });
  }

  onScrollToTargetHome(): void {
    this.router.navigate(['/home']);
  }

    openDialog(){
       this.dialog.open(DialogBoxComponent,{
      }) 
    }
    

}

document.addEventListener('DOMContentLoaded', () => {
  const dropdownBtn = document.querySelector('.dropdown-btn') as HTMLElement;
  const dropdown = document.querySelector('.dropdown') as HTMLElement;

  dropdownBtn.addEventListener('click', () => {
      if (dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
      } else {
          dropdown.style.display = 'block';
      }
  });

  window.addEventListener('click', (event: MouseEvent) => {
      if (!(event.target as HTMLElement).matches('.dropdown-btn')) {
          if (dropdown.style.display === 'block') {
              dropdown.style.display = 'none';
          }
      }
  });
});
