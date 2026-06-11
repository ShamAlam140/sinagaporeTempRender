import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Man } from '../../models/man.modal';
import { ManagerService } from '../../services/manager.service';
import { CreateManagerDialogComponent } from '../create-manager-dialog/create-manager-dialog.component';

@Component({
  standalone: false,
  selector: 'app-create-manager',
  templateUrl: './create-manager.component.html',
  styleUrls: ['./create-manager.component.css'],
})
export class CreateManagerComponent implements OnInit {
  managers: Man[] = [];

  constructor(
    public dialog: MatDialog,
    private managerService: ManagerService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getManagers();
  }

  getManagers(){
    this.managerService.getManagers().subscribe(res=>{
      this.managers = res; console.log(res);
    })
  }

  deleteManager(data){
    let id = { id: data._id }
    this.managerService.deleteManager(id).subscribe(res=>{
      this.getManagers();
      this.showNotification(
        'snackbar-danger',
        'Manager Deleted Successfully...',
        'bottom',
        'center'
      );
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateManagerDialogComponent, {
      width: '600px',
      data: { type: 'new' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result === 'Added'){
        this.getManagers();
        this.showNotification(
          'snackbar-success',
          'Manager Added Successfully...',
          'bottom',
          'center'
        );
      }
    });
  }

  updateManager(man){
    const dialogRef = this.dialog.open(CreateManagerDialogComponent, {
      width: '600px',
      data: { type: 'edit', man: man },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result === 'updated'){
        this.getManagers();
        this.showNotification(
          'snackbar-success',
          'Manager Record Updated!',
          'bottom',
          'center'
        );
      }
    });
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
