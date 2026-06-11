import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { HolidayService } from '../../services/holiday.service';

@Component({
  standalone: false,
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.css'],
})
export class AddEventDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { start: string; end: string; title: string },
    public holidayService: HolidayService,
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    private empService: EmployeeService
  ) { }

  minDate: string;

  ngOnInit(): void {
    this.minDate = this.data.start;
  }

  onSubmit() {
    let b = {
      title: this.data.title,
      start: this.data.start,
      end: this.data.end,
      type: "holiday"
    }

    this.holidayService.postHolidays(b).subscribe(res => {
      this.dialogRef.close('Added');
    }, err => {
      console.log('Failed to add holiday:', err);
    });
  }
}
