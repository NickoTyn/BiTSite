import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AccountComponent } from '../account/account.component';
import { Auth, User, getAuth, onAuthStateChanged } from '@angular/fire/auth';


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

  constructor(public dialog: MatDialog){
    this.auth = getAuth(); // Initialize the Auth instance
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
    })


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
  




    openDialog(){
      this.dialog.open(DialogBoxComponent,{
        backdropClass: 'userActivationDialog'
      })
    }
    

}


