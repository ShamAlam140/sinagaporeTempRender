import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { ManagerService } from '../../services/manager.service';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  standalone: false,
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MappingComponent implements OnInit {
  managers = [];
  employees: EMP[] = [];
  displayedColumns: string[] = ['index', 'name', 'userName', 'leaveIssuer'];
  listData: MatTableDataSource<any>;

  coveringEmployees2 = [];

  expandedElement: Employee | null;

  coveringEmp = [];
  firstCoveringEmp;
  currEmp;

  reportingMan2 = [];
  reportingMan3 = []
  firstReportingManager;
  reportingEmployee;

  constructor(
    public empService: EmployeeService,
    public managerService: ManagerService,
    public adminService: SuperAdminService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getEmployees();
    this.getManagers();

    // Programmatically handle disabled state for coveringEmp2
    this.empService.coveringEmployeeForm.get('coveringEmp2').disable();
    this.empService.coveringEmployeeForm.get('coveringEmp1').valueChanges.subscribe(val => {
      if (val) {
        this.empService.coveringEmployeeForm.get('coveringEmp2').enable();
      } else {
        this.empService.coveringEmployeeForm.get('coveringEmp2').disable();
      }
    });

    // Programmatically handle disabled state for reportingMan2
    this.managerService.reportingManForm.get('reportingMan2').disable();
    this.managerService.reportingManForm.get('reportingMan1').valueChanges.subscribe(val => {
      if (val) {
        this.managerService.reportingManForm.get('reportingMan2').enable();
      } else {
        this.managerService.reportingManForm.get('reportingMan2').disable();
      }
    });
  }

  getEmployees() {
    this.empService.getEveryEmployees().subscribe((data) => {
      this.employees = data; console.log(this.employees);
    });
  }


  getManagers() {
    this.managerService.getManager().subscribe((data) => {
      this.managers = data;
    })
  }

  changeCoverEmp1(employee: EMP, emp, type) {
    this.coveringEmployees2 = [];
    employee.allCoveringEmployees.forEach(cEmp => {
      if (cEmp.name !== emp.name) {
        this.coveringEmployees2.push(cEmp);
      }
    })
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

  changeReportMan2(emp, i, rMan, firstMan) {
    let reportMan3 = [];
    this.reportingMan3 = [];
    this.managers.forEach(man => {
      if (man.managerName !== firstMan) {
        reportMan3.push(man.managerName);
      }
    })
    reportMan3.forEach(man => {
      if (man !== rMan) {
        this.reportingMan3.push(man);
      }
    })
    console.log(this.reportingMan3);
  }

  submitCoveringEmp(data, employee) {
    console.log(data, employee);
    let bothCoveringEmployees = [];
    const emp1id = data.coveringEmp1._id;
    const emp2id = data.coveringEmp2._id;
    let coveringEmp1 = { _id: data.coveringEmp1._id, name: data.coveringEmp1.name, email: data.coveringEmp1.email }
    let coveringEmp2 = { _id: data.coveringEmp2._id, name: data.coveringEmp2.name, email: data.coveringEmp2.email }
    bothCoveringEmployees.push(coveringEmp1, coveringEmp2);
    const coveringEmployees = { coveringEmployees: bothCoveringEmployees };
    this.empService.updateCoveringData(coveringEmployees, employee._id).subscribe((res: EMP) => {
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
      this.getEmployees();
      this.getManagers();
      this.empService.coveringEmployeeForm.reset();
    })
  }

  submitReportingManagers(data, employee) {
    console.log(data);
    const bothReportingManagers = [];
    const man1id = data.reportingMan1._id;
    const man2id = data.reportingMan2._id;
    let reportingMan1 = { name: data.reportingMan1.managerName, _id: data.reportingMan1._id, email: data.reportingMan1.managerEmail }
    let reportingMan2 = { name: data.reportingMan2.managerName, _id: data.reportingMan2._id, email: data.reportingMan2.managerEmail }
    bothReportingManagers.push(reportingMan1, reportingMan2);
    let result = { reportingManager: bothReportingManagers }; console.log(result);
    this.empService.updateReportingManager(result, employee._id).subscribe((res: EMP) => {
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
      this.managerService.reportingManForm.reset();
      this.getManagers();
      this.getEmployees();
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

}
