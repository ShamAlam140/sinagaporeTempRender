import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HolidayService } from '../../services/holiday.service';

@Component({
  standalone: false,
  selector: 'app-leave-dialog',
  templateUrl: './leave-dialog.component.html',
  styleUrls: ['./leave-dialog.component.css']
})
export class LeaveDialogComponent implements OnInit {

  leaveForm: FormGroup = new FormGroup({
    count: new FormControl("", Validators.required)
  })

  constructor(
    public dialogRef: MatDialogRef<LeaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private holidayService: HolidayService
  ) {
    console.log(data);
   }

  ngOnInit(): void {
  }

  updateCount(count){
    console.log(count);
    this.holidayService.updateLeaveCount(this.data._id, count).subscribe(res=>{
      this.dialogRef.close(count);
    })
  }

}
