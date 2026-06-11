import { HolidaysComponent } from './holidays/holidays.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveHistoryComponent } from '../employee/leave-history/leave-history.component';
import { EmployeesReportingComponent } from './employees-reporting/employees-reporting.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { ManagerProfileComponent } from './manager-profile/manager-profile.component';
import { LeaveReportsComponent } from './leave-reports/leave-reports.component';
import { PolicyComponent } from './policy/policy.component';
import { CancelRequestComponent } from './cancel-request/cancel-request.component';

const routes: Routes = [
  {
    // path: '',
    // component: ManagerComponent,
    path: 'manager-profile',
    component: ManagerProfileComponent,
  },
  {
    path: 'employees-reporting',
    component: EmployeesReportingComponent,
  },
  {
    path: 'holidays',
    component: HolidaysComponent,
  },
  {
    path: 'leave-requests',
    component: LeaveRequestsComponent,
  },
  {
    path: 'leave-reports',
    component: LeaveReportsComponent,
  },
  {
    path: 'leave-history',
    component: LeaveHistoryComponent,
  },
  {
    path: 'cancel-request',
    component: CancelRequestComponent,
  },
  {
    path: 'policy',
    component: PolicyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}
