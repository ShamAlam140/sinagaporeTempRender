import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoaderService } from '../loader/loader.service';
import { IUser, UserService } from './services/user.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  inputvalue: string = ''; // Initialize inputvalue

  constructor(
    private userService: UserService,
    private router: Router,
    public loaderService: LoaderService,
    private snackbar: MatSnackBar
  ) {}

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
  });

  roles = ['Manager', 'Employee', 'SuperAdmin'];

  ngOnInit(): void {}

  onLogin(userData) {
    const role = userData.role; console.log(userData);
    this.userService.login(userData).subscribe(
      (res: IUser) => {
        console.log(res);
        const response = res;
        if (role === 'Employee') {
          localStorage.setItem('employee', JSON.stringify(response));
          this.router.navigateByUrl('/employee/user-profile');
        } else if (role === 'Manager') {
          localStorage.setItem('manager', JSON.stringify(response));
          this.router.navigateByUrl('/manager/manager-profile');
        } else if (role === 'SuperAdmin') {
          localStorage.setItem('superadmin', JSON.stringify(response));
          this.router.navigateByUrl('/super-admin/super-admin-profile');
        }
        this.showNotification(
          'snackbar-success',
          'Login Successful...',
          'bottom',
          'center'
        );
        this.loginForm.reset();
      },
      (err) => {
        this.userService.isInvalidUser.next(true);
        this.showNotification(
          'snackbar-danger',
          'Invalid Credentials!!',
          'bottom',
          'center'
        );
      }
    );
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  onInputChange(event: any) {
    if (typeof event === 'string') {
      this.inputvalue = event.toLowerCase();
    }
  }
}
