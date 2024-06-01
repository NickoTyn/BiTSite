import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MakeAPostComponent } from './make-a-post.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef: MatDialogRef<MakeAPostComponent> | null = null;

  constructor(private dialog: MatDialog) {}

  openDialog(data: any): void {
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(MakeAPostComponent, {
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
