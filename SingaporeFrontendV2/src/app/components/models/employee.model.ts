import { formatDate } from '@angular/common';

export class Employee {
  id: number;
  name: string;
  email: string;
  username: string;
  dob: string;
  joind: string;
  leave: [
    {
      "s.no": number;
      leavetype: string;
      days: number;
      reason: string;
      from: string;
      to: string;
      status: string;
    }
  ];
  leaveissuer: string;
  sickleave: number;
  casual: number;
  paid: number;
  vacation: number;
  total: number;
  coveringEmployees: [
    
  ];
  coverEmp: [];
  cover: [];
  reportingManager: [];

  constructor(employee) {
    this.id = employee.id;
    this.name = employee.name;
    this.email = employee.email;
    this.username = employee.username;
    this.dob = formatDate(new Date(), 'yyyy-mm-dd', 'en');
    this.joind = formatDate(new Date(), 'yyyy-mm-dd', 'en');
    this.leave = employee.leave;
    this.leaveissuer = employee.leaveissuer;
    this.total = employee.total;
    this.sickleave = employee.sickleave;
    this.casual = employee.casual;
    this.paid = employee.paid;
    this.vacation = employee.vacation;
    this.coveringEmployees = employee.coveringEmployees;
    this.coverEmp = employee.coverEmp;
    this.reportingManager = employee.reportingManager;
  }
}
