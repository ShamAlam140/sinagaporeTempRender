import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { CoveringEmpComponent } from './covering-emp/covering-emp.component';
import { CoveringTaskComponent } from './covering-task/covering-task.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { LeaveHistoryComponent } from './leave-history/leave-history.component';
import { LogOutComponent } from './log-out/log-out.component';
import { NotificationComponent } from './notification/notification.component';
import { PolicyComponent } from './policy/policy.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  {
    path: 'user-profile',
    component: UserProfileComponent,
  },
  {
    path: 'apply-leave',
    component: ApplyLeaveComponent,
  },
  {
    path: 'holidays',
    component: HolidaysComponent,
  },
  {
    path: 'leave-history',
    component: LeaveHistoryComponent,
  },
  {
    path: 'notifications',
    component: NotificationComponent,
  },
  {
    path: 'covering-emp',
    component: CoveringEmpComponent,
  },
  {
    path: 'policy',
    component: PolicyComponent,
  },
  {
    path: 'log-out',
    component: LogOutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
