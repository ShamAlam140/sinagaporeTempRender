import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EditEventDialogComponent } from '../../super-admin/edit-event-dialog/edit-event-dialog.component';
import { HolidayService } from '../../services/holiday.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  standalone: false,
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css'],
})
export class HolidaysComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public holidayService: HolidayService
  ) { }

  ngOnInit(): void {
    this.holidayService.getHolidays().subscribe((res) => {
      this.calendarOptions.events = res; console.log(res);
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
    }); console.log(clickInfo.event);
  }
}
