import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HolidayService } from '../../services/holiday.service';

@Component({
  standalone: false,
  selector: 'app-edit-event-dialog',
  templateUrl: './edit-event-dialog.component.html',
  styleUrls: ['./edit-event-dialog.component.css'],
})
export class EditEventDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { start: string; end: string; title: string; action; id },
    public holidayService: HolidayService,
    public dialogRef: MatDialogRef<EditEventDialogComponent>
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  deleteHoliday(){
    let data = { id: this.data.id }
    this.holidayService.removeHoliday(data).subscribe(res=>{
      this.dialogRef.close('Deleted')
    })
  }
}
