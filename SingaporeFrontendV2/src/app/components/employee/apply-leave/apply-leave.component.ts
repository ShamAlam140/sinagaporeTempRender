import { HolidayService } from './../../services/holiday.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Certificate } from '../../models/certificate.modal';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DialogComponent } from '../dialog/dialog.component';
import { QdialogComponent } from '../qdialog/qdialog.component';
import { formatDate } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.css'],
})
export class ApplyLeaveComponent implements OnInit {
  // minDate = new Date(); // Removed to allow selection of past dates
  leaveTypes = ['Sick', 'Paid', 'Casual', 'Vacation'];
  employee: Employee;
  currUser: EMP;
  certificate;
  isUploading: boolean = false;
  showCerti: Boolean = false;
  leaves = [];
  previousLeaves = [];

  months = [{ month: 0, days: 31 }, { month: 1, days: 28 }, { month: 2, days: 31 }, { month: 3, days: 30 },
  { month: 4, days: 31 }, { month: 5, days: 30 }, { month: 6, days: 31 }, { month: 7, days: 31 },
  { month: 8, days: 30 }, { month: 9, days: 31 }, { month: 10, days: 30 }, { month: 11, days: 31 }
  ]

  sDate;
  eDate;

  halfDayChecked: boolean = false;
  showHalfDaybool: boolean = false;

  halftype = "";
  specialcase: boolean = false;

  reportingManagers = [];
  coveringEmployees = [];

  constructor(
    public empService: EmployeeService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,

    private holidayService: HolidayService
  ) { }

  ngOnInit(): void {
    this.getCurrUser();
    this.getUserReportingManagers();
    this.getUserCoveringOfficer();
    this.holidayService.getHolidays().subscribe((res: any) => {
      console.log("holiday", res);
      this.calendarOptions.events = res;
    });
  }

  checkStartDate(sdate) {
    let totalDate = new Date(sdate);
    this.sDate = totalDate.getDate();
  }

  checkEndDate(edate) {
    let totalDate = new Date(edate);
    this.eDate = totalDate.getDate();
    if (this.sDate === this.eDate) {
      this.showHalfDaybool = true;
    }
    else {
      this.showHalfDaybool = false;
      this.halfDayChecked = false;
      this.halftype = "";
    }
  }

  checkHalfDayLeave(event, data) {

    console.log(event);

    this.halfDayChecked = true;
    // if (this.halfDayChecked == false) {

    // }
    // if (this.halfDayChecked == true) {
    // }

    if (data == 1) {
      this.halftype = "AM"

    } else {
      this.halftype = "PM"

    }
    console.log(this.halftype);
  }

  specialCase(event) {
    this.specialcase = event.checked;
  }

  getUserReportingManagers() {
    this.currUser.reportingManager.forEach(res => {
      this.reportingManagers.push({ name: res.name, email: res.email });
    })
  }

  getUserCoveringOfficer() {
    this.currUser.coveringEmployees.forEach(res => {
      console.log("covering", res);
      this.coveringEmployees.push({
        name: res.name,
        email: res.email

      });
    })
  }

  getCurrUser() {
    this.currUser = JSON.parse(localStorage.getItem('employee')); console.log(this.currUser);
    this.empService.getEmployees(this.currUser._id).subscribe((res: any) => {
      this.currUser = res;
      let date = new Date();
      if (this.currUser && this.currUser.leaveType) {
        this.leaves = this.currUser.leaveType.filter(x => x.year === date.getFullYear());
        this.previousLeaves = this.currUser.leaveType.filter(x => x.year === date.getFullYear() - 1);
      } else {
        this.leaves = [];
        this.previousLeaves = [];
      }
    });

  }

  selectedLeaveType: string = '';

  leaveType(type) {
    this.selectedLeaveType = type; // Track the selected leave type
    if (type === 'Hospitalization' || type === 'Sick/Casual') {
      this.showCerti = true;
    } else {
      this.showCerti = false;
    }
  }

  async onSubmit(data: any) {
    try {
      if (this.isUploading) {
        alert('Certificate is still uploading to the server. Please wait a few seconds and click apply again.');
        return;
      }

      if (data.leaveType === 'Hospitalization' && !this.certificate) {
        alert(`Please upload a certificate for ${data.leaveType} leave.`);
        return;
      }

      let d1 = new Date(data.range.fromDate);
      let d2 = new Date(data.range.toDate);
      let startDate = new Date(data.range.fromDate);
      let endDate = new Date(data.range.toDate);
      // Backend now securely calculates working days and validates balance limit
      let id = this.currUser['_id'];

      let leaveData = {
        type: data.leaveType,
        count: 0, // Calculated exactly by the backend now
        email: this.currUser['empEmail'],
        pcount: 0,
        stage: '',
        fromDate: d1.toISOString(),
        toDate: d2.toISOString(),
        reason: data.leaveReason,
        status: "Pending",
        halftype: this.halftype,
        certificate: this.certificate,
        approve1: false,
        specialcase: false,
        approve2: false,
        reportingManager1: this.reportingManagers[0],
        reportingManager2: this.reportingManagers[1],
        coveringofficer: this.coveringEmployees
      };

      // Send exactly ONE call. Backend seamlessly handles Calendar, Math, Math, Checks, and Database
      this.empService.applyLeave(leaveData, id).subscribe({
        next: (res: any) => {
          this.showNotification(
            'snackbar-success',
            'Leave Applied Successfully...!!!',
            'bottom',
            'center'
          );

          this.empService.applyLeaveForm.reset();
          // Refetch current user
          this.empService.getEmployees(this.currUser._id).subscribe(res => {
            localStorage.setItem('employee', JSON.stringify(res));
            location.reload();
          });
        },
        error: (err) => {
          console.log('Failed to apply leave:', err);
          alert(err.error?.message || 'Already Applied. Please Choose Another Date.');
        }
      });
    } catch (error) {
      console.log('Error in onSubmit:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }



  uploadCertificate(event) {
    this.isUploading = true;
    this.empService.uploadCertificates(event.target.files[0]).subscribe({
      next: (res: Certificate) => {
        this.certificate = res.longUrl;
        this.isUploading = false;
      },
      error: (err) => {
        console.log("Upload error", err);
        this.isUploading = false;
        alert("Failed to upload the certificate. Please try again.");
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
  //calender
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    eventBorderColor: 'black',
    initialView: 'dayGridMonth',
    eventClick: this.handleEventClick.bind(this),
  };

  handleEventClick(clickInfo: EventClickArg) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        calendar: clickInfo.event,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        title: clickInfo.event.title,
        id: clickInfo.event._def.publicId,
        action: 'view',
      },
      width: '30%',
      height: '225px',
    });
  }

}
