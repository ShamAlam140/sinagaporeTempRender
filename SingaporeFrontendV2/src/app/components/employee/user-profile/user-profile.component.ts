import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { AddreportingmanagerComponent } from './addreportingmanager/addreportingmanager.component';
import { HolidayService } from '../../services/holiday.service';
import { EMP } from '../../models/emp.modal';

@Component({
  standalone: false,
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  @ViewChild('f') employeeForm: NgForm;

  currUser;
  employee!: Employee;
  reportingManagers;
  leaves = [];
  currYear;
  annualLeave = 0;

  constructor(public empService: EmployeeService, private dialog: MatDialog, private holidayService: HolidayService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    let date = new Date();
    this.currYear = date.getFullYear();
    this.getDate();
    this.getCurrUser();
    this.getTotalLeaves();
  }

  getDate() {

  }

  clearNotification(noti) {
    let body = { id: this.currUser._id, nid: noti.nid }
    console.log(body);
    this.empService.deleteNotification(body).subscribe(res => {
      this.getEmployeeProfile();
      this.showNotification(
        'snackbar-danger',
        'Notification Deleted!',
        'bottom',
        'center'
      );
    });
  }

  getCurrUser() {
    let date = new Date();
    this.currUser = JSON.parse(localStorage.getItem('employee'));

    this.empService.getEmployees(this.currUser._id).subscribe((res: any) => {
      this.currUser = res; console.log(this.currUser); console.log(this.currYear);
      this.leaves = this.currUser.leaveType.filter(x => x.year === this.currYear);


      // this.leaves = this.currUser.leaveType.filter(x=> x.year === date.getFullYear())
      this.leaves.forEach(leave => {

        if (leave.type == "RH" || leave.type == "Hospitalization") {

        }
        else {
          this.annualLeave = this.annualLeave + leave.remaining
        }

      })
      console.log(this.currUser);
      this.reportingManagers = this.currUser.reportingManager;
    });

  }

  getEmployeeProfile() {
    this.empService.getEmployees(this.currUser._id).subscribe(res => {
      localStorage.setItem('employee', JSON.stringify(res));
      this.getCurrUser();
    })
  }

  getTotalLeaves() {
    // this.holidayService.getLeaves().subscribe(res=>{
    //   res.forEach(leave=>{
    //     this.currUser.leaveType.forEach(element => {
    //       if(element.type === leave.type){
    //         let body = { remain: element.count, total: leave.count, type: leave.type };
    //         this.leaves.push(body);
    //       }
    //     });
    //   })
    //   console.log(this.leaves);
    // })
  }

  changeReportingManagers() {
    const dialogRef = this.dialog.open(AddreportingmanagerComponent, {
      data: "covering",
      width: "50%",
      height: "250px"
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res === "updated") {
        this.getEmployeeProfile();
      }
    })
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
