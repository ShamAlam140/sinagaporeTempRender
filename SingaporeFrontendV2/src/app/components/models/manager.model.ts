import { formatDate } from '@angular/common';

export class Manager {
  id: number;
  managerName: string;
  managerEmail: string;
  managerUserName: string;
  managerDob: string;
  managerJoined: string;
  employeesReporting: [
    {
      empUserName: string;
      empId: number;
      empName: string;
    }
  ];

  constructor(manager: {
    id: number;
    managerName: string;
    managerEmail: string;
    managerUserName: string;
    managerDob: string;
    managerJoined: string;
    employeesReporting: [
      { empUserName: string; empId: number; empName: string }
    ];
  }) {
    this.id = manager.id;
    this.managerName = manager.managerName;
    this.managerEmail = manager.managerEmail;
    this.managerUserName = manager.managerUserName;
    this.managerDob = formatDate(new Date(), 'yyyy-mm-dd', 'en');
    this.managerJoined = formatDate(new Date(), 'yyyy-mm-dd', 'en');
    this.employeesReporting = manager.employeesReporting;
  }
}
