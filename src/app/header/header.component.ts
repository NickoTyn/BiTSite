import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { RouterOutlet } from '@angular/router';
import { AccountComponent } from '../account/account.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, AccountComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {



  authService = inject(AuthService);

  ngOnInit(): void {
    this.openDialog(); /* delete this when finished */
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
  }

  constructor(public dialog: MatDialog){};

    openDialog(){
      this.dialog.open(DialogBoxComponent,{
        panelClass: 'custom-modalbox'
      })
    }


}
