import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HolidayService } from '../../services/holiday.service';

@Component({
  standalone: false,
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      start: string;
      end: string;
      title: string;
      action: string;
      id: number;
    },
    public holidayService: HolidayService,
    public dialogRef: MatDialogRef<DialogComponent>
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
