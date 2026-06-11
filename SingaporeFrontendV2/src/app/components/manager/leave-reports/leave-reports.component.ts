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

@Component({
  standalone: false,
  selector: 'app-leave-reports',
  templateUrl: './leave-reports.component.html',
  styleUrls: ['./leave-reports.component.css'],
})
export class LeaveReportsComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = ['index', 'name', 'userName', 'totalLeaves'];
  listData: MatTableDataSource<any>;
  currUser;
  searchKey: string;

  emp: EMP[] = []

  constructor(public empService: EmployeeService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.currentUser();
    this.getAllEmployees();
  }

  currentUser(){
    this.currUser = JSON.parse(localStorage.getItem('manager'));
  }

  getAllEmployees(){
    this.empService.getEveryEmployees().subscribe(res=>{
      console.log("hvfggh", res);
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
}
