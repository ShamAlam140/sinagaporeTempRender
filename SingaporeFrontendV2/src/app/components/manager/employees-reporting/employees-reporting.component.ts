import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../../services/manager.service';
import { EMP } from '../../models/emp.modal';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { ShowDetailsDialogComponent } from '../show-details-dialog/show-details-dialog.component';
@Component({
  standalone: false,
  selector: 'app-employees-reporting',
  templateUrl: './employees-reporting.component.html',
  styleUrls: ['./employees-reporting.component.css'],
})
export class EmployeesReportingComponent implements OnInit {
  employees: Employee[] = [];
   displayedColumns: string[] = ['index', 'name', 'userName'];
   listData = new MatTableDataSource<any>();
   currUser;
   searchKey: string;
 
   emp: EMP[] = []
 
   constructor(public empService: EmployeeService) {}
 
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
       this. emp = res;
       this.listData.data = this.emp;
     })
   }
 
   onSearchClear(){
     this.searchKey = "";
     this.applyFilter();
   }
 
   applyFilter() {
     this.listData.filter = this.searchKey.trim().toLowerCase();
   }
 
  
 }
 