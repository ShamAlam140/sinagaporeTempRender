import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { HolidayService } from '../../services/holiday.service';
import { ManagerService } from '../../services/manager.service';
import { DialogComponent } from '../dialog/dialog.component';
import { CommentComponent } from './comment/comment.component';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatDate } from '@angular/common';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.css'],
})
export class LeaveRequestsComponent implements OnInit {
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
      console.log("All Employees:", res);

      // We look at ALL employees. If their pending leave requires this manager's approval, we show it.
      // We do NOT rely on the manager's employeesReporting/reportingEmployees array because it can be out of sync.
      res.forEach(emp => {
        if (!emp.leave) return;

        emp.leave.forEach(leave => {
          if (leave.status === 'Pending') {

            // Fix coveringofficer if it's null
            if (leave.coveringofficer == null) {
              leave.coveringofficer = [{ name: "" }, { name: "" }];
            }

            // Check if this user is Reporting Manager 1 and needs to approve
            if (leave.reportingManager1?.name === this.currUser.managerName) {
              if (leave.approve1 === false) {
                let leaveToSee = leave;
                leaveToSee.empName = emp.empName;
                leaveToSee.empId = emp._id;
                this.empPending.push(leaveToSee);
              }
            }
            // Or if this user is Reporting Manager 2 AND RM1 has already approved
            else if (leave.reportingManager2?.name === this.currUser.managerName) {
              if (leave.approve2 === false && leave.approve1 === true) {
                let leaveToSee = leave;
                leaveToSee.empName = emp.empName;
                leaveToSee.empId = emp._id;
                this.empPending.push(leaveToSee);
              }
            }
          }
        });
      });
    });
  }

  ngOnInit(): void {
    this.currentUser();
    this.getLeaves();
    this.holidayService.getHolidays().subscribe((res) => {
      this.calendarOptions.events = res;
    });
  }

  currentUser() {
    this.currUser = JSON.parse(localStorage.getItem('manager')); console.log(this.currUser);
    this.reportingEmployees = this.currUser.employeesReporting;
  }

  openDialog(action: string, employee, i) {
    console.log(employee);
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { action, employee },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      console.log(result);
      if (result.action === 'Approve') {
        if (result.employee.approve2 === false) {
          if (result.employee.reportingManager1.name === this.currUser.managerName) {
            result.employee.approve1 = true;
            let body: any = { hid: result.employee.hid, id: result.employee.empId, approve1: true };
            if (result.employee.mngcomment) {
              body.mngcomment = result.employee.mngcomment;
            }

            this.empService.updateLeaveApprove1(body).subscribe(res => {
              this.empPending.splice(i, 1);
              this.showNotification('snackbar-success', 'Leave Approved As Manager 1...!', 'bottom', 'center');
              this.getLeaves();
            }, err => {
              console.log('Approve1 failed:', err);
              this.showNotification('snackbar-danger', 'Approval failed. Please try again.', 'bottom', 'center');
            });
          }
          else if (result.employee.reportingManager2.name === this.currUser.managerName) {
            result.employee.approve2 = true;
            let body: any = { hid: result.employee.hid, id: result.employee.empId, approve2: true };
            if (result.employee.mngcomment) {
              body.mngcomment = result.employee.mngcomment;
            }

            // Atomic backend handles status=Approved, balance deductions, emails, and notifications automatically.
            this.empService.updateLeaveApprove2(body).subscribe(res => {
              this.empPending.splice(i, 1);
              this.showNotification('snackbar-success', 'Leave Fully Approved As Manager 2...!', 'bottom', 'center');
              this.getLeaves();
            }, err => {
              console.log('Approve2 failed:', err);
              this.showNotification('snackbar-danger', 'Approval failed. Please try again.', 'bottom', 'center');
            });
          }
        }
      }
      else if (result.action === 'Deny') {
        // Atomic updateleave backend handles status=Denied, calendar updates, emails, and notifications
        let body: any = {
          'leave.$.status': 'Denied',
          'status': 'Denied'
        };
        if (result.employee.mngcomment) {
          body['leave.$.mngcomment'] = result.employee.mngcomment;
        }

        this.empService.updateLeave(body, result.employee.email, result.employee.hid).subscribe(res => {
          this.empPending.splice(i, 1);
          this.showNotification('snackbar-danger', 'Leave Denied...!', 'bottom', 'center');
          this.getLeaves();
        }, err => {
          console.log('Denial failed:', err);
          this.showNotification('snackbar-danger', 'Denial update failed.', 'bottom', 'center');
        });
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

  handleEventClick(employee) {
    const dialogRef = this.dialog.open(CommentComponent, {
      data: employee,
      width: '30%',
      height: '245px',
    });


  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    eventBorderColor: 'black',
    initialView: 'dayGridMonth',
  };
}
