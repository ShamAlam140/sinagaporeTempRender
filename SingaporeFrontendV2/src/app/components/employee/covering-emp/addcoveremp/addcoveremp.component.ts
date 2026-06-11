import { Cover } from './../../../models/cover.modal';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMP } from 'src/app/components/models/emp.modal';
import { Employee } from 'src/app/components/models/employee.model';
import { EmployeeService } from 'src/app/components/services/employee.service';
import { Covers } from 'src/app/components/models/covers.modsl';

@Component({
  standalone: false,
  selector: 'app-addcoveremp',
  templateUrl: './addcoveremp.component.html',
  styleUrls: ['./addcoveremp.component.css']
})
export class AddcoverempComponent implements OnInit {
  currUser;
  employees;
  coveringEmployees2

  constructor(
    public empService: EmployeeService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<AddcoverempComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit(): void {
    this.currentUser();

    this.empService.coveringEmployeeForm.get('coveringEmp2').disable();
    this.empService.coveringEmployeeForm.get('coveringEmp1').valueChanges.subscribe(val => {
      if (val) {
        this.empService.coveringEmployeeForm.get('coveringEmp2').enable();
      } else {
        this.empService.coveringEmployeeForm.get('coveringEmp2').disable();
      }
    });
  }

  currentUser() {
    this.currUser = JSON.parse(localStorage.getItem('employee'));
    this.employees = this.currUser.allCoveringEmployees;
  }

  submitCoveringEmp(data) {
    const bothCoveringEmployees = [];
    const emp1id = data.coveringEmp1._id;
    const emp2id = data.coveringEmp2._id;
    let coveringEmp1 = { name: data.coveringEmp1.name, _id: data.coveringEmp1._id, email: data.coveringEmp1.email }
    let coveringEmp2 = { name: data.coveringEmp2.name, _id: data.coveringEmp2._id, email: data.coveringEmp2.email }
    bothCoveringEmployees.push(coveringEmp1, coveringEmp2);
    let result = { coveringEmployees: bothCoveringEmployees }
    console.log(result);
    this.empService.updateCoveringData(result, this.currUser._id).subscribe((res: EMP) => {
      console.log(res);
      let emptocover = { name: res.empName, _id: res._id };

      this.empService.getEmployees(emp1id).subscribe((res: EMP) => {
        let cover1 = res.cover;
        const checker = []
        for (let i = 0; i < cover1.length; i++) {
          if (cover1[i]._id === emptocover._id) {
            checker.push(cover1[i]);
          }
        }
        if (checker.length === 0) {
          cover1.push(emptocover);
          const cover = { cover: cover1 }
          console.log(cover);
          this.empService.updateCoverData(cover, emp1id).subscribe(res => {
            console.log(res);
          })
        }
      })

      this.empService.getEmployees(emp2id).subscribe(res => {
        let cover2 = res.cover;
        const checker = []
        for (let i = 0; i < cover2.length; i++) {
          if (cover2[i]._id === emptocover._id) {
            checker.push(cover2[i]);
          }
        }
        if (checker.length === 0) {
          cover2.push(emptocover);
          const cover = { cover: cover2 }
          console.log(cover);
          this.empService.updateCoverData(cover, emp2id).subscribe(res => {
          })
        }
      })
      this.showNotification(
        'snackbar-success',
        'Covering Employees Updated Successfully...!',
        'bottom',
        'center'
      );
      this.dialogRef.close('updated')
    })
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  changeCoverEmp1(emp, type) {
    if (type === 'first') {
      this.coveringEmployees2 = []
      this.currUser.allCoveringEmployees.forEach(coverEmp => {
        if (coverEmp.name !== emp.name) {
          this.coveringEmployees2.push(coverEmp);
        }
      })
      console.log(this.coveringEmployees2);
    }
  }
}
