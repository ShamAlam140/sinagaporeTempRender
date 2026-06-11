import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { HolidayService } from '../../services/holiday.service';
import { ManagerService } from '../../services/manager.service';
import { DialogComponent } from '../dialog/dialog.component';
import { EventClickArg } from '@fullcalendar/core';
import { CommentComponent } from '../leave-requests/comment/comment.component';

@Component({
  standalone: false,
  selector: 'app-cancel-request',
  templateUrl: './cancel-request.component.html',
  styleUrls: ['./cancel-request.component.css']
})
export class CancelRequestComponent implements OnInit {

  empPending = [];
  employee: Employee;
  totalLeaves = 0;
  empList = [];

  currUser;
  reportingEmployees = [];

  coveringEmp = []

  constructor(
    public empService: EmployeeService,
    private holidayService: HolidayService,
    public managerService: ManagerService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  openImage(url) {
    open(url);
  }

  getLeaves() {
    this.empPending = [];
    this.empService.getEveryEmployees().subscribe(res => {
      console.log(res);
      this.reportingEmployees.forEach(rEmp => {
        res.forEach(emp => {
          if (rEmp.empId === emp._id) {
            emp.leave.forEach(leave => {

              if (leave.stage === 'Cancel') {

                if (leave.reportingManager1 != null) {
                  if (leave.reportingManager1.name != null) {
                    leave.reportingManager1 = leave.reportingManager1.name;
                  } else {
                    leave.reportingManager1 = leave.reportingManager1;
                  }
                }

                if (leave.reportingManager2 != null) {
                  if (leave.reportingManager2.name != null) {
                    leave.reportingManager2 = leave.reportingManager2.name;
                  } else {
                    leave.reportingManager2 = leave.reportingManager2;
                  }
                }




                if (leave.reportingManager1 === this.currUser.managerName) {
                  if (leave.approve2 === false) {
                    let leaveToSee = leave;
                    leaveToSee.empName = emp.empName;
                    leaveToSee.empId = emp._id; console.log(leaveToSee);

                    if (leaveToSee.coveringofficer == null) {
                      leaveToSee.coveringofficer = [
                        {
                          name: "",
                        },
                        {
                          name: "",
                        }
                      ]


                    }



                    this.empPending.push(leaveToSee);
                  }
                }
                else if (leave.reportingManager2 === this.currUser.managerName) {
                  if (leave.approve2 === true) {
                    let leaveToSee = leave;
                    leaveToSee.empName = emp.empName;
                    leaveToSee.empId = emp._id; console.log(leaveToSee);
                    this.empPending.push(leaveToSee);
                  }
                }
              }
            })
          }
        })
      });
    })
  }

  ngOnInit(): void {
    this.currentUser();
    this.getLeaves();
  }

  currentUser() {
    this.currUser = JSON.parse(localStorage.getItem('manager')); console.log(this.currUser);
    this.reportingEmployees = this.currUser.employeesReporting;
  }



  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  handleEventClick(employee) {

    let body = { 'leave.$.stage': "Close", 'leave.$.pcount': 0, "status": 'Denied' }

    this.empService.updateLeave(body, employee.email, employee.tid).subscribe(res => {
      this.showNotification(
        'snackbar-success',
        'Leave Cancel Request Send...!!!',
        'bottom',
        'center'
      );

    }, (err) => {
      console.log(err);
    })


    let bo = { 'count': employee.pcount, 'email': employee.email, 'type': employee.type }

    this.empService.updatecount(body).subscribe(res => {
      this.showNotification(
        'snackbar-success',
        'Leave Cancel Request Send...!!!',
        'bottom',
        'center'
      );

      let by = {
        "color": "red",
        "_id": employee.hid

      }
      this.holidayService.putHolidays(by).subscribe(res => {

      }, (err) => {
        console.log(err);
      })

      let b = {
        senderEmail: employee.email,
        recieverEmail: [employee.email, employee.reportingManager2.email, employee.reportingManager1.email, employee.coveringofficer[0].email, employee.coveringofficer[1].email],
        subject: "CANCEL LEAVE  T F",
        message: "Dear Sir/ Mam, Test Apply leave. Please Check ",

      }
      this.empService.sendEmail(b).subscribe(res => {

      }, (err) => {
        console.log(err);
      })
    }, (err) => {
      console.log(err);
    })


  }
}
