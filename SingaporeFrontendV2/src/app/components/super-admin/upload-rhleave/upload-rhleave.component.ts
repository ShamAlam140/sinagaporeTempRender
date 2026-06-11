import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { EditEventDialogComponent } from '../edit-event-dialog/edit-event-dialog.component';
import { HolidayService } from '../../services/holiday.service';
import { SuperAdminService } from '../../services/super-admin.service';
import readXlsxFile from 'read-excel-file'
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,
  selector: 'app-upload-rhleave',
  templateUrl: './upload-rhleave.component.html',
  styleUrls: ['./upload-rhleave.component.css']
})
export class UploadRhleaveComponent implements OnInit {

  holidays = [];
  uploadFromExcelBool: boolean = false;
  publicHolidays = [];
  showExcelTable: boolean = false;

  constructor(
    public dialog: MatDialog,
    public holidayService: HolidayService,
    private snackbar: MatSnackBar,
    private adminService: SuperAdminService,
    private empService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.getHolidayes();
  }

  getHolidayes() {
    this.holidayService.getHolidays().subscribe((res) => {
      console.log(res);
      this.holidays = res;
      this.calendarOptions.events = this.holidays;
    });
  }

  uploadExcel(e) {
    let fileReaded: any;
    fileReaded = e.target.files[0];
    this.publicHolidays = [];
    const schema = {
      'HolidayDetails': {
        prop: 'title',
        type: String,
        required: false
      },
      'StartDate': {
        prop: 'start',
        type: Date,
        required: false
      },
      'EndDate': {
        prop: 'end',
        type: Date,
        required: false
      }
    };

    readXlsxFile(e.target.files[0], { schema }).then((data) => {
      console.log(data);
      if (data.rows) {
        this.showExcelTable = true;
        for (let i of data.rows) {
          this.publicHolidays.push(i);
        }
      }
    })
  }

  uploadHoliday(data, index) {
    let startFullDay = new Date(data.start);
    let startDate = startFullDay.getDate();
    let startMonth = startFullDay.getMonth() + 1;
    let startYear = startFullDay.getFullYear();
    if (startMonth < 10) {
      data.start = `${startYear}-0${startMonth}-${startDate}`;
    }
    else {
      data.start = `${startYear}-${startMonth + 1}-${startDate}`;
    }

    let endFullDay = new Date(data.end);
    let endDate = endFullDay.getDate();
    let endMonth = endFullDay.getMonth() + 1;
    let endYear = endFullDay.getFullYear();
    if (endMonth < 10) {
      data.end = `${endYear}-0${endMonth}-${endDate}`;
    }
    else {
      data.end = `${endYear}-${endMonth}-${endDate}`;
    }

    console.log(data);
    this.holidayService.postHolidays(data).subscribe(res => {
      this.empService.getEveryEmployees().subscribe(res => {
        res.forEach(emp => {
          let body = { leaveTitle: data.title, leaveDescription: data.start + ' to ' + data.end }
          this.empService.uploadNotification(body, emp._id).subscribe();
        })
        this.publicHolidays.splice(index, 1);
        this.showNotification(
          'snackbar-success',
          'Holiday Uploaded!',
          'bottom',
          'center'
        );
      })
    })
  }

  uploadAllHolidays() {

  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
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
    selectable: true,
    select: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
  };

  handleDateClick(arg) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      data: {
        start: arg.dateStr || arg.startStr,
        end: arg.endStr,
        title: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Added') {
        this.getHolidayes();
        this.showNotification(
          'snackbar-success',
          'Holiday Added Successfully...',
          'bottom',
          'center'
        );
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      data: {
        calendar: clickInfo.event,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        title: clickInfo.event.title,
        id: clickInfo.event.extendedProps['_id'],
        action: 'view',
      },
      width: '30%',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res === 'Deleted') {
        this.getHolidayes();
        this.showNotification(
          'snackbar-danger',
          'Holiday Deleted!',
          'bottom',
          'center'
        );
      }
    })
  }

}
