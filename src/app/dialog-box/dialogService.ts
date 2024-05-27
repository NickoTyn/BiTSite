import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogBoxComponent } from './dialog-box.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef: MatDialogRef<DialogBoxComponent> | null = null;

  constructor(private dialog: MatDialog) {}

  openDialog(data: any): void {
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(DialogBoxComponent, {
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
