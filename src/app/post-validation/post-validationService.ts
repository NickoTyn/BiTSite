import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PostValidationComponent } from './post-validation.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef: MatDialogRef<PostValidationComponent> | null = null;

  constructor(private dialog: MatDialog) {}

    //Dialog Open/Close

  openDialog(data: any): void {
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(PostValidationComponent, {
        data: data,
        disableClose: true,
      });

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

}
