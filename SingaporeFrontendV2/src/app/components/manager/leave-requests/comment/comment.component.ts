import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { Employee } from 'src/app/components/models/employee.model';
import { EMP } from 'src/app/components/models/emp.modal';
import { EmployeeService } from 'src/app/components/services/employee.service';
import { HolidayService } from 'src/app/components/services/holiday.service';
import { Certificate } from 'src/app/components/models/certificate.modal';
import { DialogComponent } from 'src/app/components/manager/dialog/dialog.component';

@Component({
  standalone: false,
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  comment: any;

  constructor(
    public empService: EmployeeService,

    @Inject(MAT_DIALOG_DATA)

    public data: any,
  ) {

  }

  ngOnInit(): void {

  }
  onsubmit() {

    console.log(this.data)
    let user = { "leave.$.mngcomment": this.comment };
    this.empService.updateComment(user, this.data.employee.email, this.data.employee.tid).subscribe(res => {
      alert(
        'Comment Send'
      )
    }, (err) => {
      alert(err)
    })


    let b = {
      senderEmail: [this.data.employee.email],
      recieverEmail: [this.data.employee.email],
      subject: "COMMENT   T F",
      message: "Dear Sir/ Mam, Test Apply leave. Please Check ",

    }
    this.empService.sendEmail(b).subscribe(res => {

    }, (err) => {
      console.log(err);
    })
  }


}
