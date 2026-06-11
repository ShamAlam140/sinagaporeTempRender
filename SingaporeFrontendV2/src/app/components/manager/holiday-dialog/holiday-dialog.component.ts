import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HolidayService } from '../../services/holiday.service';

@Component({
  standalone: false,
  selector: 'app-holiday-dialog',
  templateUrl: './holiday-dialog.component.html',
  styleUrls: ['./holiday-dialog.component.css']
})
export class HolidayDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public holidayService: HolidayService,
    public dialogRef: MatDialogRef<HolidayDialogComponent>
  ) { 
    console.log(data);
    
  }

  ngOnInit(): void {
  }

}
