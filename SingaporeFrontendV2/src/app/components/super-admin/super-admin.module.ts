import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { SuperAdminComponent } from './super-admin.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { SuperAdminProfileComponent } from './super-admin-profile/super-admin-profile.component';
import { MappingComponent } from './mapping/mapping.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { AddEventDialogComponent } from './add-event-dialog/add-event-dialog.component';
import { EditEventDialogComponent } from './edit-event-dialog/edit-event-dialog.component';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { PolicyComponent } from './policy/policy.component';
import { UploadLeaveComponent } from './upload-leave/upload-leave.component';
import { CreateManagerComponent } from './create-manager/create-manager.component';
import { CreateManagerDialogComponent } from './create-manager-dialog/create-manager-dialog.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { LeaveDialogComponent } from './leave-dialog/leave-dialog.component';
import { LogOutComponent } from './log-out/log-out.component';
import { LeaveReportsComponent } from './leave-reports/leave-reports.component';
import { ShowDetailsDialogComponent } from './show-details-dialog/show-details-dialog.component';
import { EditLeavesComponent } from './edit-leaves/edit-leaves.component';
import { ManageCoveringEmpComponent } from './manage-covering-emp/manage-covering-emp.component';
import { UploadRhleaveComponent } from './upload-rhleave/upload-rhleave.component';

@NgModule({
  declarations: [
    SuperAdminComponent,
    NavbarComponent,
    SuperAdminProfileComponent,
    MappingComponent,
    HolidaysComponent,
    AddEventDialogComponent,
    EditEventDialogComponent,
    CreateUserComponent,
    CreateUserDialogComponent,
    PolicyComponent,
    UploadLeaveComponent,
    CreateManagerComponent,
    CreateManagerDialogComponent,
    LeaveDialogComponent,
    LeaveReportsComponent,
    ShowDetailsDialogComponent,
    LogOutComponent,
    EditLeavesComponent,
    ManageCoveringEmpComponent,
    UploadRhleaveComponent
  ],
  imports: [CommonModule, SuperAdminRoutingModule, MaterialModule],
})
export class SuperAdminModule {}
