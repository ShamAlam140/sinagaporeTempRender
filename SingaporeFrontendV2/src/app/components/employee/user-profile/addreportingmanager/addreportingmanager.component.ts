import { EMP } from 'src/app/components/models/emp.modal';
import { Manager } from './../../../models/manager.model';
import { ManagerService } from './../../../services/manager.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Man } from 'src/app/components/models/man.modal';
import { EmployeeService } from 'src/app/components/services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-addreportingmanager',
  templateUrl: './addreportingmanager.component.html',
  styleUrls: ['./addreportingmanager.component.css']
})
export class AddreportingmanagerComponent implements OnInit {
  managers: Man[] = [];
  reportingMan2 = [];
  currUser;

  constructor(
    public managerService: ManagerService,
    public dialogRef: MatDialogRef<AddreportingmanagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private empService: EmployeeService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.currentUser();
    this.getManagers();

    this.managerService.reportingManForm.get('reportingMan2').disable();
    this.managerService.reportingManForm.get('reportingMan1').valueChanges.subscribe(val => {
      if (val) {
        this.managerService.reportingManForm.get('reportingMan2').enable();
      } else {
        this.managerService.reportingManForm.get('reportingMan2').disable();
      }
    });
  }

  currentUser() {
    this.currUser = JSON.parse(localStorage.getItem('employee'));
  }

  submitReportingManagers(data) {
    const bothReportingManagers = [];
    const man1id = data.reportingMan1._id;
    const man2id = data.reportingMan2._id;
    let reportingMan1 = { name: data.reportingMan1.managerName, _id: data.reportingMan1._id, email: data.reportingMan1.managerEmail }
    let reportingMan2 = { name: data.reportingMan2.managerName, _id: data.reportingMan2._id, email: data.reportingMan2.managerEmail }
    bothReportingManagers.push(reportingMan1, reportingMan2);
    let result = { reportingManager: bothReportingManagers }; console.log(result);
    this.empService.updateReportingManager(result, this.currUser._id).subscribe((res: EMP) => {
      let employee = { empUserName: res.empUserName, empId: res._id, empName: res.empName };
      this.managers.forEach(man => {
        if (man._id === man1id) {
          const checker = []
          for (let i = 0; i < man.employeesReporting.length; i++) {
            if (man.employeesReporting[i].empId === employee.empId) {
              checker.push(man.employeesReporting[i]);
            }
          }
          if (checker.length === 0) {
            this.managerService.putReportingEmployees(employee, man1id).subscribe();
          }
        }
      })

      this.managers.forEach(man => {
        if (man._id === man2id) {
          const checker = []
          for (let i = 0; i < man.employeesReporting.length; i++) {
            if (man.employeesReporting[i].empId === employee.empId) {
              checker.push(man.employeesReporting[i]);
            }
          }
          if (checker.length === 0) {
            this.managerService.putReportingEmployees(employee, man2id).subscribe();
          }
        }
      })
      this.showNotification(
        'snackbar-success',
        'Reporting Managers Updated Successfully...!',
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

  changeReportMan1(selectedMan, type) {
    if (type === 'first') {
      this.reportingMan2 = [];
      this.managers.forEach(man => {
        if (man._id !== selectedMan._id) {
          this.reportingMan2.push(man)
        }
      })
    }
  }

  getManagers() {
    this.managerService.getManagers().subscribe(res => {
      this.managers = res; console.log(this.managers);
    })
  }
}
