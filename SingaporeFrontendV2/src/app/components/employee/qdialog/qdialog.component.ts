import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HolidayService } from '../../services/holiday.service';


@Component({
  standalone: false,
  selector: 'app-qdialog',
  templateUrl: './qdialog.component.html',
  styleUrls: ['./qdialog.component.css']
})
export class QdialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      text: string;
      action : Boolean
     
    },
    public holidayService: HolidayService,
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  onclick(){
    this.data.action = true;
  }

}
