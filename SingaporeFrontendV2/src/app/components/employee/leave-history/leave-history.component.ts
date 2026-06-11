
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../services/employee.service';
import { HolidayService } from '../../services/holiday.service';
import { CommentComponent } from './comment/comment.component';
import { EditLeaveComponent } from './edit-leave/edit-leave.component';

@Component({
  standalone: false,
  selector: 'app-leave-history',
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.css'],
})
export class LeaveHistoryComponent implements OnInit {
  currUser: any;
  leaves: any[] = [];

  constructor(
    public empService: EmployeeService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private holidayService: HolidayService,
  ) {
    this.getCurrentUser();
  }

  ngOnInit(): void { }

  getCurrentUser() {
    this.currUser = JSON.parse(localStorage.getItem('employee')); console.log(this.currUser);
    this.empService.getEmployees(this.currUser._id).subscribe((res: any) => {
      this.leaves = res.leave || [];
    }, err => {
      console.log('Error fetching leaves', err);
    });
  }

  handleEventClick(employee) {
    this.dialog.open(CommentComponent, {
      data: employee,
      width: '30%',
      height: '245px',
    });
  }

  handleEditClick(employee) {
    const dialogRef = this.dialog.open(EditLeaveComponent, {
      data: employee,
      width: '50%',
      // let the edit dialog size be auto (or you can set a height)
      // height: '40%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // if edit saved, refresh leaves
      if (result === 'updated') {
        this.getCurrentUser();
      }
    });
  }

  handledelete(employee) {
    console.log("deleting leave", employee);
    const body = { 'leave.$.stage': 'Close', 'leave.$.pcount': 0, 'leave.$.status': 'Denied' };

    this.empService.updateLeave(body, employee.email, employee.hid).subscribe({
      next: (res: any) => {
        if (res && res.updatedRecord) {
          this.leaves = res.updatedRecord.leave || [];
        } else {
          this.getCurrentUser();
        }

        this.showNotification('snackbar-success', 'Leave Cancelled...!!!', 'bottom', 'center');
      },
      error: (err) => {
        console.log('Update leave error', err);
        this.getCurrentUser();
        this.showNotification('snackbar-danger', 'Something went wrong; please try again.', 'bottom', 'center');
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
