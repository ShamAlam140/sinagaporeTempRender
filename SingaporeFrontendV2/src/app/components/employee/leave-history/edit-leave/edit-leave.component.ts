import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Employee } from 'src/app/components/models/employee.model';
import { EMP } from 'src/app/components/models/emp.modal';
import { EmployeeService } from 'src/app/components/services/employee.service';
import { HolidayService } from 'src/app/components/services/holiday.service';
import { Certificate } from 'src/app/components/models/certificate.modal';
import { DialogComponent } from 'src/app/components/manager/dialog/dialog.component';
import { formatDate } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-edit-leave',
  templateUrl: './edit-leave.component.html',
  styleUrls: ['./edit-leave.component.css']
})
export class EditLeaveComponent implements OnInit {

  leaveTypes = ['Sick', 'Paid', 'Casual', 'Vacation'];

  employee: Employee;
  currUser: EMP;
  certificate: string | null = null;
  showCerti: boolean = false;
  leaves: any[] = [];
  previousLeaves: any[] = [];

  sDate: number;
  eDate: number;

  halfDayChecked: boolean = false;
  showHalfDaybool: boolean = false;
  halftype: string = '';
  specialcase: boolean = false;

  reportingManagers: any[] = [];
  coveringEmployees: any[] = [];

  selectedLeaveType: string = '';

  // Flags
  isApprovedLeave: boolean = false;
  isPastApprovedLeave: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public cdata: any,
    public empService: EmployeeService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    private holidayService: HolidayService
  ) { }

  ngOnInit(): void {
    this.getCurrUser();
    this.initFromDialogLeave();
    this.getUserReportingManagers();
    this.getUserCoveringOfficer();

    this.holidayService.getHolidays().subscribe((res) => {
      this.calendarOptions.events = res;
    });
  }

  /** Dialog se aaya hua leave data se form prefill + flags set */
  private initFromDialogLeave() {
    const leave = this.cdata?.leave;
    if (!leave) return;

    // status check
    if (leave.status === 'Approved') {
      this.isApprovedLeave = true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const from = new Date(leave.fromDate);
      from.setHours(0, 0, 0, 0);

      // past approved leave ko block karna
      this.isPastApprovedLeave = from < today;
    }

    try {
      const fromDate = leave.fromDate ? new Date(leave.fromDate) : null;
      const toDate = leave.toDate ? new Date(leave.toDate) : null;

      this.empService.applyLeaveForm.patchValue({
        range: {
          fromDate,
          toDate
        },
        leaveType: leave.type,
        leaveReason: leave.reason
      });

      this.selectedLeaveType = leave.type;
      this.certificate = leave.certificate || null;
      this.halftype = leave.halftype || '';
    } catch (e) {
      console.log('Error while patching edit form:', e);
    }
  }

  /** Current user + leaveType */
  getCurrUser() {
    this.currUser = JSON.parse(localStorage.getItem('employee') || '{}');

    if (!this.currUser || !this.currUser._id) return;

    this.empService.getEmployees(this.currUser._id).subscribe((res: any) => {
      this.currUser = res;
      let date = new Date();
      this.leaves = this.currUser.leaveType.filter((x: any) => x.year === date.getFullYear());
      this.previousLeaves = this.currUser.leaveType.filter((x: any) => x.year === date.getFullYear() - 1);
    });
  }

  /** Reporting Managers */
  getUserReportingManagers() {
    if (!this.currUser?.reportingManager) return;

    this.currUser.reportingManager.forEach((res: any) => {
      this.reportingManagers.push({ name: res.name, email: res.email });
    });
  }

  /** Covering employees */
  getUserCoveringOfficer() {
    if (!this.currUser?.coveringEmployees) return;

    this.currUser.coveringEmployees.forEach((res: any) => {
      this.coveringEmployees.push({
        name: res.name,
        email: res.email
      });
    });
  }

  /** Start Date change */
  checkStartDate(sdate: any) {
    let totalDate = new Date(sdate);
    this.sDate = totalDate.getDate();
  }

  /** End Date change */
  checkEndDate(edate: any) {
    let totalDate = new Date(edate);
    this.eDate = totalDate.getDate();
    if (this.sDate === this.eDate) {
      this.showHalfDaybool = true;
    } else {
      this.showHalfDaybool = false;
      this.halfDayChecked = false;
      this.halftype = '';
    }
  }

  /** Half day selection (AM/PM) */
  checkHalfDayLeave(event: any, data: number) {
    this.halfDayChecked = true;
    this.halftype = data === 1 ? 'AM' : 'PM'; console.log('Half type:', this.halftype);
  }

  /** Special case toggle */
  specialCase(event: any) {
    this.specialcase = event.checked;
  }

  /** Leave type select */
  leaveType(type: string) {
    this.selectedLeaveType = type;

    if (type === 'Hospitalization' || type === 'Sick/Casual') {
      this.showCerti = true;
    } else {
      this.showCerti = false;
    }
  }

  /** Certificate upload */
  uploadCertificate(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.empService.uploadCertificates(file).subscribe((res: Certificate | any) => {
      this.certificate = (res && (res.longUrl || res.url)) || null;
    });
  }

  /** Snackbar helper */
  showNotification(colorName: string, text: string, placementFrom: any, placementAlign: any) {
    this.snackbar.open(text, '', {
      duration: 3000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  /** Calendar options */
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
    this.dialog.open(DialogComponent, {
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

  /** MAIN: Edit Leave Submit */
  async onSubmit() {
    // UI level guard: past approved leave -> mat bhejo
    if (this.isApprovedLeave && this.isPastApprovedLeave) {
      this.showNotification(
        'snackbar-danger',
        'Approved past leave cannot be edited. Only future approved leave can be edited.',
        'bottom',
        'center'
      );
      return;
    }

    const form: FormGroup = this.empService.applyLeaveForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const data = form.value;

    try {
      if (data.leaveType === 'Hospitalization' && !this.certificate) {
        alert('Please upload a certificate for Hospitalization leave.');
        return;
      }

      this.isSubmitting = true;

      let startDate = new Date(data.range.fromDate);
      let endDate = new Date(data.range.toDate);

      let id = this.currUser['_id'];
      // Build leave payload — count is calculated by the backend server-side
      let leaveData: any = {
        'leave.$.type': data.leaveType,
        // count removed: backend recalculates using calculateActualLeaveDays
        'leave.$.pcount': 0,
        'leave.$.email': this.currUser['empEmail'],
        'leave.$.fromDate': startDate.toISOString(),
        'leave.$.toDate': endDate.toISOString(),
        'leave.$.reason': data.leaveReason,
        'leave.$.halftype': this.halftype,
        'leave.$.certificate': this.certificate,
        'leave.$.specialcase': this.specialcase,
        'leave.$.reportingManager1': this.reportingManagers[0],
        'leave.$.reportingManager2': this.reportingManagers[1],
        'leave.$.coveringofficer': this.coveringEmployees
      };

      this.empService.updateLeave(
        leaveData,
        this.currUser['empEmail'],
        this.cdata.hid
      ).subscribe(
        () => {
          this.showNotification(
            'snackbar-success',
            'Leave Updated Successfully...!!!',
            'bottom',
            'center'
          );

          this.empService.applyLeaveForm.reset();
          this.isSubmitting = false;
          this.dialog.closeAll();

          // Return 'updated' to parent so it can refresh data
          // (parent's afterClosed handler calls getCurrentUser)
        },
        (err) => {
          console.log('Failed to update leave:', err);
          this.isSubmitting = false;
          const msg = err.error?.message || 'Failed to update leave. Please choose another date.';
          this.showNotification('snackbar-danger', msg, 'bottom', 'center');
        }
      );

    } catch (error) {
      console.log('Error in onSubmit:', error);
      this.isSubmitting = false;
      alert('An unexpected error occurred. Please try again later.');
    }
  }
}
