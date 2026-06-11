import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { ManagerProfileComponent } from './manager-profile/manager-profile.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { DialogComponent } from './dialog/dialog.component';
import { FullCalendarModule } from '@fullcalendar/angular';

import { EmployeesReportingComponent } from './employees-reporting/employees-reporting.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { LeaveReportsComponent } from './leave-reports/leave-reports.component';
import { ShowDetailsDialogComponent } from './show-details-dialog/show-details-dialog.component';
import { HolidayDialogComponent } from './holiday-dialog/holiday-dialog.component';
import { LogOutComponent } from './log-out/log-out.component';
import { PolicyComponent } from './policy/policy.component';
import { CommentComponent } from './leave-requests/comment/comment.component';
import { CancelRequestComponent } from './cancel-request/cancel-request.component';

@NgModule({
  declarations: [
    ManagerComponent,
    NavbarComponent,
    ManagerProfileComponent,
    LeaveRequestsComponent,
    DialogComponent,
    HolidaysComponent,
    EmployeesReportingComponent,
    LeaveReportsComponent,
    ShowDetailsDialogComponent,
    HolidayDialogComponent,
    LogOutComponent,
    PolicyComponent,
    CommentComponent,
    CancelRequestComponent
  ],
  imports: [
    CommonModule,
    ManagerRoutingModule,
    MaterialModule,
    FullCalendarModule,
  ],
})
export class ManagerModule {}
