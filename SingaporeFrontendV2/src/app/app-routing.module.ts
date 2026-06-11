import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeComponent } from './components/employee/employee.component';
import { LoginComponent } from './components/login/login.component';
import { ManagerComponent } from './components/manager/manager.component';
import { SuperAdminComponent } from './components/super-admin/super-admin.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./components/employee/employee.module').then(
        (m) => m.EmployeeModule
      ),

    component: EmployeeComponent,
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('./components/manager/manager.module').then(
        (m) => m.ManagerModule
      ),
    component: ManagerComponent,
  },
  {
    path: 'super-admin',
    loadChildren: () =>
      import('./components/super-admin/super-admin.module').then(
        (m) => m.SuperAdminModule
      ),
    component: SuperAdminComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
