import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMP } from '../../models/emp.modal';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,
  selector: 'app-manage-covering-emp',
  templateUrl: './manage-covering-emp.component.html',
  styleUrls: ['./manage-covering-emp.component.css']
})
export class ManageCoveringEmpComponent implements OnInit {
  empList: EMP[] = [];
  empControl = new FormControl([], Validators.required);
  firstEmpName;
  selectCoveringEmpBool: boolean = false;

  allCoveringEmp = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ManageCoveringEmpComponent>,
    public empService: EmployeeService
  ) { 
    console.log(data);
  }

  ngOnInit(): void {
    this.getAllEmployees();
  }

  getAllEmployees(){
    this.empService.getEveryEmployees().subscribe(res=>{
      this.empList = res.filter(x => x._id !== this.data._id); console.log(this.empList);
    })
  }

  assignFirstName(){
    if(this.empControl.value.length !== 0){
      this.firstEmpName = this.empControl.value[0].empName; console.log(this.firstEmpName);
    }
    else{
      this.firstEmpName = '';
    }
  }

  submitCoveringEmployees(){
    this.allCoveringEmp = [];
    this.empControl.value.forEach(emp => {
      let data = { _id: emp._id, name: emp.empName , email : emp.empEmail};
      this.allCoveringEmp.push(data);
    });
    let body = { allCoveringEmployees: this.allCoveringEmp };
    let id = this.data._id; console.log(body);
    this.empService.updateAllCoveringEmployees(body, id).subscribe(res=>{
      this.dialogRef.close('added');
    })
  }

}
