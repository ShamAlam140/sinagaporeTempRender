import { ManageCoveringEmpComponent } from './../manage-covering-emp/manage-covering-emp.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { EditLeavesComponent } from '../edit-leaves/edit-leaves.component';

@Component({
  standalone: false,
  selector: 'app-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  employees: EMP[] = [];

  constructor(public dialog: MatDialog, private empService: EmployeeService, private snackbar: MatSnackBar) {}

  ngOnInit(): void {
   this.getEmployees();
  }

  getEmployees(){
    this.empService.getEveryEmployees().subscribe(res=>{
      console.log(res);
      this.employees = res;
    })
  }

  editLeave(data){
    console.log(data);
    const dialogRef = this.dialog.open(EditLeavesComponent, {
      width: '65%',
      minHeight: '450px',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result === 'Added'){
        this.getEmployees();
        this.showNotification(
          'snackbar-success',
          'Leave Updated!',
          'bottom',
          'center'
        );
      }
    })
  }

  editUser(emp){
    console.log(emp);
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '700px',
      minHeight: '450px',
      data: { type: 'edit', emp: emp },
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res === 'updated'){
        this.showNotification(
          'snackbar-success',
          'Employee Record Updated!',
          'bottom',
          'center'
        );
        this.getEmployees();
      }
    })
  }

  deleteEmployee(data){
    let emp = { id: data._id };
    this.empService.deleteEmployee(emp).subscribe(res=>{
      this.getEmployees();
        this.showNotification(
          'snackbar-danger',
          'Employee Deleted Successfully...',
          'bottom',
          'center'
        );
    })
  }

  manageAllCoveringEmployees(employee){
    console.log(employee);
    const dialogRef = this.dialog.open(ManageCoveringEmpComponent, {
      width: '700px',
      minHeight: '550px',
      data: employee
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res === 'added'){
        this.showNotification(
          'snackbar-success',
          'Covering Employees Updated!',
          'bottom',
          'center'
        );
        this.getEmployees();
      }
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '700px',
      minHeight: '550px',
      data: { type: 'new' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result === 'Added'){
        this.getEmployees();
        this.showNotification(
          'snackbar-success',
          'Employee Created Successfully...',
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
