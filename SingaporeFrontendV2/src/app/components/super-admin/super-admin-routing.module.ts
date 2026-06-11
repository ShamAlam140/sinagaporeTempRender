import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateManagerComponent } from './create-manager/create-manager.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { MappingComponent } from './mapping/mapping.component';
import { PolicyComponent } from './policy/policy.component';
import { SuperAdminProfileComponent } from './super-admin-profile/super-admin-profile.component';
import { UploadLeaveComponent } from './upload-leave/upload-leave.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { LeaveReportsComponent } from './leave-reports/leave-reports.component';
import { UploadRhleaveComponent } from './upload-rhleave/upload-rhleave.component';

const routes: Routes = [
  {
    path: 'super-admin-profile',
    component: SuperAdminProfileComponent,
  },
  {
    path: 'user',
    component: CreateUserComponent,
  },
  {
    path: 'manager',
    component: CreateManagerComponent,
  },
  {
    path: 'upload-policies',
    component: PolicyComponent,
  },
  {
    path: 'upload-leaves',
    component: UploadLeaveComponent,
  },
  {
    path: 'upload-holidays',
    component: HolidaysComponent,
  },
  {
    path: 'upload-rh',
    component: UploadRhleaveComponent,
  },
  {
    path: 'employee-manager',
    component: MappingComponent,
  },
  {
    path: 'leave-reports',
    component: LeaveReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuperAdminRoutingModule {}
