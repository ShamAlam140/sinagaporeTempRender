import { Component, Inject, OnInit } from '@angular/core';
import {  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/components/services/employee.service';

@Component({
  standalone: false,
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

 
  comment  : any;

  constructor(
    public empService: EmployeeService,

    @Inject(MAT_DIALOG_DATA)

    public data: any,
  ) {

  }

  ngOnInit(): void {
   
  } 

  onsubmit(){
    let user = { "leave.$.usercomment": this.comment };
      this.empService.updateComment(user, this.data.email , this.data.hid).subscribe(res=>{
         alert(
          'Comment Send'
         )
      }, (err)=>{
          alert(err)
      })
  }

}
