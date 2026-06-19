import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  employeeLoginUrl,
  managerLoginUrl,
  superadminLoginUrl,
} from 'src/app/config/api';

export interface IUser {
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isInvalidUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  login(user: IUser) {
    if (user.role === 'Employee') {
      const currUser = { empEmail: user.email, empPassword: user.password };
      return this.http.post(employeeLoginUrl, currUser);
    } else if (user.role === 'Manager') {
      const currUser = { managerEmail: user.email, managerPassword: user.password };
      return this.http.post(managerLoginUrl, currUser);
    } else if (user.role === 'SuperAdmin') {
      const currUser = { email: user.email, password: user.password };

      return this.http.post(superadminLoginUrl, currUser);
    } else {
      return null;
    }
  }
}
