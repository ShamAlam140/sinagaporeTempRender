import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { ShowDetailsDialogComponent } from '../show-details-dialog/show-details-dialog.component';
import * as XLSX from 'xlsx';

@Component({
  standalone: false,
  selector: 'app-leave-reports',
  templateUrl: './leave-reports.component.html',
  styleUrls: ['./leave-reports.component.css'],
})
export class LeaveReportsComponent implements OnInit {
  employees = [];
  displayedColumns: string[] = ['index', 'name', 'userName', 'totalLeaves'];
  listData: MatTableDataSource<any>;
  currUser;
  searchKey: string;

  emp: EMP[] = [];

  previousLeaveTotal = 0;
  entitledLeaveTotal = 0;
  currLeaveUsed = 0;
  sickEntitled = 0;
  sickUsed = 0;
  currentYear;



  constructor(public empService: EmployeeService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.currentUser();
    this.getAllEmployees();
    this.getLeavesRecordWhole();
  }

  currentUser(){
    this.currUser = JSON.parse(localStorage.getItem('manager'));
  }

  getAllEmployees(){
    this.empService.getEveryEmployees().subscribe(res=>{
      this.emp = res;
      this.emp.forEach(employee=>{
        employee.totalLeaves = 0;
        employee.leave.forEach(leave=>{
          if(leave.status === "Approved"){
            employee.totalLeaves = employee.totalLeaves + leave.count;
          }
        })
      })
      this.listData = new MatTableDataSource(this.emp);
    })
  }

  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }

  showDetails(row) {
    const dialogRef = this.dialog.open(ShowDetailsDialogComponent, {
      width: '750px',
      minHeight: '400px',
      data: row,
    });
    dialogRef.afterClosed().subscribe();
  }

  exportExcel(): void{
    let element = document.getElementById('excel-data');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, `Leave-Data.xlsx`);
  }

  getLeavesRecordWhole(){
    this.currentYear = new Date().getFullYear();
    this.empService.getEveryEmployees().subscribe(res=>{
      res.forEach(employee=>{
        let emp: any = {}
        this.previousLeaveTotal = 0;
        this.entitledLeaveTotal = 0;
        this.currLeaveUsed = 0;
        this.sickEntitled = 0;
        this.sickUsed = 0;

        let currLeave = employee.leaveType.filter(x => x.year === this.currentYear);
        currLeave.forEach(leave=>{
          if(leave.type !== 'Sick'){
            this.entitledLeaveTotal = this.entitledLeaveTotal + leave.count;
          }
        })

        employee.leaveType.forEach(leave=>{
          if(leave.type !== 'Sick'){
            this.currLeaveUsed = this.currLeaveUsed + (leave.count - leave.remaining)
          }
        })

        currLeave.forEach(leave=>{
          if(leave.type === 'Sick'){
            this.sickEntitled = this.sickEntitled + leave.count;
            this.sickUsed = this.sickUsed + (leave.count - leave.remaining);
          }
        })

        let remaining = employee.leaveType.filter(x => x.year === this.currentYear-1);
        remaining.forEach(leave=>{
          if(leave.type !== 'Sick'){
            this.previousLeaveTotal = this.previousLeaveTotal + leave.remaining;
          }
        })

        emp.previous = this.previousLeaveTotal;
        emp.entitled = this.entitledLeaveTotal;
        emp.currUsed = this.currLeaveUsed;
        emp.total = emp.previous + emp.entitled;
        emp.leaveBalance = emp.total - emp.currUsed;
        emp.sickUsed = this.sickUsed;
        emp.sickEntitled = this.sickEntitled;
        emp.medicalBalance = this.sickEntitled - this.sickUsed;
        emp.name = employee.empName;
        this.employees.push(emp)
      })
    })
  }
}
