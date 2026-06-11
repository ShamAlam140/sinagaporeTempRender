import { HolidayService } from './../../services/holiday.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.css'],
})
export class CreateUserDialogComponent implements OnInit {
  empList: EMP[] = [];
  empControl = new FormControl([], Validators.required);
  firstEmpName;
  empId;

  constructor(
    public empService: EmployeeService,
    private holidayService: HolidayService,
    public dialogRef: MatDialogRef<CreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    if(data.type === 'edit'){
      this.empId = this.data.emp._id;
      empService.userForm.get('empName').setValue(data.emp.empName);
      empService.userForm.get('empUserName').setValue(data.emp.empUserName);
      empService.userForm.get('empDob').setValue(data.emp.empDob);
      empService.userForm.get('empJoined').setValue(data.emp.empJoined);
      empService.userForm.get('empEmail').setValue(data.emp.empEmail);
      empService.userForm.get('empPassword').setValue(data.emp.empPassword);
      empService.userForm.get('empEmail').setValue(data.emp.empEmail);
    }
    else if(data.type === 'new'){
      empService.userForm.reset();
    }
  }

  ngOnInit(): void {
   this.empService.getEveryEmployees().subscribe(res=>{
     this.empList = res;
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

  onSubmit(data, coveringEmployees) {

    if(this.data.type === 'new'){
      console.log(data); console.log(coveringEmployees);
      let allcover = [];
      coveringEmployees.forEach(emp => {
        let coverEmp = { _id: emp._id, name: emp.empName , email : emp.empEmail};
        allcover.push(coverEmp);
      });
      const final = { allCoveringEmployees: allcover }
      console.log(final);
      this.empService.postEmployee(data).subscribe(response=>{
        this.empService.updateAllCoveringEmployees(final, response._id).subscribe(res=>{
          this.dialogRef.close('Added');
          this.empService.userForm.reset();
        })
      })
    }

    else if(this.data.type === 'edit'){
      console.log(data);
      this.empService.updateEmployee(this.empId, data).subscribe(res=>{
        this.dialogRef.close('updated');
      })
    }
    
  }
}
