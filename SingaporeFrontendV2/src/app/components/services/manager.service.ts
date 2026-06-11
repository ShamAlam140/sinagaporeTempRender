import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Man } from '../models/man.modal';
import { Manager } from '../models/manager.model';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  constructor(private http: HttpClient) { }

  reportingManagerForm: FormGroup = new FormGroup({
    reportingMan1: new FormControl('', Validators.required),
    reportingMan2: new FormControl('', Validators.required),
    reportingMan3: new FormControl('')
  })

  reportingManForm: FormGroup = new FormGroup({
    reportingMan1: new FormControl('', Validators.required),
    reportingMan2: new FormControl('', Validators.required)
  })

  managerForm: FormGroup = new FormGroup({
    managerName: new FormControl('', Validators.required),
    managerUserName: new FormControl('', Validators.required),
    managerEmail: new FormControl('', [Validators.required, Validators.email]),
    managerDob: new FormControl('', Validators.required),
    managerJoined: new FormControl('', Validators.required),
    managerPassword: new FormControl('', Validators.required)
  });

  getManager() {
    return this.http.get<Manager[]>(`${environment.apiUrl}/manager/getManagers?hr_key=62bd553f463149f102b33300`);
  }

  getManagers() {
    return this.http.get<Man[]>(`${environment.apiUrl}/manager/getManagers?hr_key=62bd553f463149f102b33300`);
  }

  postManager(data) {
    return this.http.post<Man>(`${environment.apiUrl}/manager/addmanager?hr_key=62bd553f463149f102b33300`, data);
  }

  putManager(data, id) {
    return this.http.post<Manager>(`${environment.apiUrl}/manager/updatemanager?id=${id}`, data);
  }

  putReportingEmployees(data, id) {
    return this.http.post(`${environment.apiUrl}/manager/addemployeesReporting?id=${id}`, data);
  }

  deleteManager(data) {
    return this.http.post(`${environment.apiUrl}/manager/removemanager`, data);
  }

  updatemanager(data, id) {
    return this.http.post(`${environment.apiUrl}/manager/updatemanager?id=${id}`, data);
  }
}
