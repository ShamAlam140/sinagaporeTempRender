import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeComponent } from './employee.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { LeaveHistoryComponent } from './leave-history/leave-history.component';
import { NotificationComponent } from './notification/notification.component';
import { DialogComponent } from './dialog/dialog.component';
import { CoveringEmpComponent } from './covering-emp/covering-emp.component';
import { CoveringTaskComponent } from './covering-task/covering-task.component';
import { AddcoverempComponent } from './covering-emp/addcoveremp/addcoveremp.component';
import { LogOutComponent } from './log-out/log-out.component';
import { AddreportingmanagerComponent } from './user-profile/addreportingmanager/addreportingmanager.component';
import { PolicyComponent } from './policy/policy.component';
import { EditLeaveComponent } from './leave-history/edit-leave/edit-leave.component';
import { CommentComponent } from './leave-history/comment/comment.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { QdialogComponent } from './qdialog/qdialog.component';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    EmployeeComponent,
    NavbarComponent,
    UserProfileComponent,
    ApplyLeaveComponent,
    HolidaysComponent,
    LeaveHistoryComponent,
    NotificationComponent,
    DialogComponent,
    CoveringEmpComponent,
    CoveringTaskComponent,
    AddcoverempComponent,
    LogOutComponent,
    AddreportingmanagerComponent,
    PolicyComponent,
    EditLeaveComponent,
    CommentComponent,
    QdialogComponent,
  ],
  imports: [CommonModule, EmployeeRoutingModule, MaterialModule,    MatSlideToggleModule,
    MatRadioModule
  ],
})
export class EmployeeModule {}
