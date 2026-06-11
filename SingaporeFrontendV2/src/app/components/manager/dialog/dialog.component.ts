import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {

  comment  = "";
  
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data,
    public empService: EmployeeService,

 
  ) {
    console.log(data);
  }

  ngOnInit(): void {}

  onsubmit(){
    this.data.mngcomment =this.comment;

    // console.log(this.data)
    // let user = { "leave.$.mngcomment":  this.comment};
    //   this.empService.updateComment(user, this.data.email , this.data.tid).subscribe(res=>{
    //      alert(
    //       'Comment Send'
    //      )
    //   }, (err)=>{
    //       alert(err)
    //   })


    //   let b= {
    //     senderEmail: [],
    //     recieverEmail: [] ,
    //     subject: "COMMENT   T F",
    //     message: "Dear Sir/ Mam, Test Apply leave. Please Check ",
    
    //   }
    //   this.empService.sendEmail(b).subscribe(res=>{
      
    //   }, (err)=>{
    //       console.log(err);
    //   })
  }

}
