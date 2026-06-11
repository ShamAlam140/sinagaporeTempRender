import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Holiday } from '../models/holiday.model';
import { Leaves } from '../models/leave.modal';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  constructor(private http: HttpClient) { }

  holidayForm: FormGroup = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
    title: new FormControl('', Validators.required),
  });

  getHolidays() {
    return this.http.get<Holiday[]>(`${environment.apiUrl}/holidays/getallholidays?hr_key=62bd553f463149f102b33300`);
  }


  getSHolidays() {
    return this.http.get<Holiday[]>(`${environment.apiUrl}/holidays/getholidays?hr_key=62bd553f463149f102b33300`);
  }

  getCleaves(data: any) {
    return this.http.post(`${environment.apiUrl}/employee/coveringleavelist`, data);
  }

  getEleaves(data) {
    return this.http.post(`${environment.apiUrl}/employee/leavelist`, data);
  }


  postHolidays(data) {
    return this.http.post<any>(`${environment.apiUrl}/holidays/addholiday?hr_key=62bd553f463149f102b33300`, data);
  }

  putHolidays(data) {
    return this.http.post(
      `${environment.apiUrl}/holidays/update`,
      data
    );
  }

  removeHolidays(data) {
    return this.http.post(
      `${environment.apiUrl}/holidays/removeholiday`,
      data
    );
  }

  getLeaves() {
    return this.http.get<Leaves[]>(`${environment.apiUrl}/leave/getleaves`);
  }

  getEmployees() {
    return this.http.get<Leaves[]>(`${environment.apiUrl}/employee/getEmployee?hr_key=62bd553f463149f102b33300`);
  }

  updateLeaveCount(id, data) {
    return this.http.post(`${environment.apiUrl}/leave/update?id=${id}`, data);
  }

  addLeave(data) {
    console.log(data);
    return this.http.post(`${environment.apiUrl}/leave/addleave?hr_key=62bd553f463149f102b33300`, data);
  }

  deleteLeave(data) {
    return this.http.post(`${environment.apiUrl}/leave/removeleave`, data);
  }

  removeHoliday(data) {
    return this.http.post(`${environment.apiUrl}/holidays/removeholiday`, data);
  }
}


