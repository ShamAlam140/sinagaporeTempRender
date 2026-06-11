import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  private formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async exportExcel(employees: any[], empName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Your Company Name';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet('Employee Leaves');
    worksheet.properties.defaultRowHeight = 20;
  
    // Set the title in the first row
    const titleRow = worksheet.addRow([empName]);
    titleRow.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF000000' } };
    worksheet.mergeCells(`A1:H1`);
  
    // Headers start from the second row directly
    const headers = ['S.No', 'Leave Type', 'From', 'To', 'Days', 'Manager1', 'Manager2', 'Status', 'Certificate'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF333399' },
        bgColor: { argb: 'FF333399' }
      };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });
  
    // Adding data rows starting from the third row
    employees.forEach((emp, index) => {
      const row = worksheet.addRow([
        index + 1,
        emp.type,
        this.formatDate(emp.fromDate),
        this.formatDate(emp.toDate),
        emp.count,
        emp.reportingManager1.name || emp.reportingManager1,
        emp.reportingManager2.name || emp.reportingManager2,
        emp.status,
        emp.certificate
      ]);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber !== 9) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
      row.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          size: 12,
          bold: false
        };
      });
    });
  
    // Set column widths for readability
    worksheet.columns = [
      { key: 'SNo', width: 10 },
      { key: 'LeaveType', width: 20 },
      { key: 'From', width: 15 },
      { key: 'To', width: 15 },
      { key: 'Days', width: 10 },
      { key: 'Manager1', width: 20 },
      { key: 'Manager2', width: 20 },
      { key: 'Status', width: 15 },
      { key: 'Certificate', width: 20 }
    ];
  
    // Write the Excel file to a buffer and save it
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${empName}.xlsx`);
  }
}  