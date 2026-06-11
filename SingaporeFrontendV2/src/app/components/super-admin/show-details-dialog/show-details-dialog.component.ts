import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { ExcelService } from '../../services/excel.service';

@Component({
  standalone: false,
  selector: 'app-show-details-dialog',
  templateUrl: './show-details-dialog.component.html',
  styleUrls: ['./show-details-dialog.component.css'],
})
export class ShowDetailsDialogComponent implements OnInit {
  employee = [];
  empName;
  fileName = 'EmployeeLeave.xlsx';

  constructor(
    public empService: EmployeeService,
    public dialogRef: MatDialogRef<ShowDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private excelService:ExcelService
  ) {
    this.employee = data.leave;
    this.empName = data.empName;
    
  }

  ngOnInit(): void {
    console.log(this.employee);
  }

  exportExcel(): void{
    this.excelService.exportExcel(this.employee, this.empName);
}
}