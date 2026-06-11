import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from './../../services/employee.service';
import { Component, OnInit } from '@angular/core';
import { CoverEmp } from '../../models/coveringEmp.modal';
import { AddcoverempComponent } from './addcoveremp/addcoveremp.component';

@Component({
  standalone: false,
  selector: 'app-covering-emp',
  templateUrl: './covering-emp.component.html',
  styleUrls: ['./covering-emp.component.css']
})
export class CoveringEmpComponent implements OnInit {
  employee;
  empToCover;
  currUser;

  constructor(private empService: EmployeeService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.currentUser();
  }

  currentUser(){
    this.currUser = JSON.parse(localStorage.getItem('employee'));
  }

  getEmployeeProfile(){
    this.empService.getEmployees(this.currUser._id).subscribe(res=>{
      localStorage.setItem('employee', JSON.stringify(res));
    })
  }

  changeCoveringEmp(){
    const dialogRef = this.dialog.open(AddcoverempComponent, {
      data: "covering",
      width: "50%",
      height: "250px"
    })
    dialogRef.afterClosed().subscribe(res=>{
      if(res === "updated"){
        this.getEmployeeProfile();
      }
    })
  }

}
