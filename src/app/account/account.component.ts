import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';

import { MakeAPostComponent } from '../make-a-post/make-a-post.component';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ReactiveFormsModule } from '@angular/forms';

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

  updateProfileForm!: FormGroup;

  data: any[] = [];
  
  constructor(public dialog: MatDialog, private dataService: AuthService) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe(data => {
      this.data = data;
    });
  }

 

  openDialog(): void {
    this.dialog.open(MakeAPostComponent, {
      panelClass: 'custom-dialog-container'
    });
  }

}
