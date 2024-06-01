import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';

import { MakeAPostComponent } from '../make-a-post/make-a-post.component';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MakeAPostComponent,
    MatDialogModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(MakeAPostComponent, {
      data: "right click"
    });
  }

}
