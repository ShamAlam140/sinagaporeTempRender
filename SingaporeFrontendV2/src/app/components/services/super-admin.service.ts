import { environment } from 'src/environments/environment';
import { Policy } from './../models/policy.modal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { coveringEmpUrl } from 'src/app/config/api';
import { Manager } from '../models/manager.model';
import { SuperAdmin } from '../models/super-admin.model';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  constructor(private http: HttpClient) { }

  superAdminForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    supName: new FormControl('', Validators.required),
    supUserName: new FormControl('', Validators.required),
    supEmail: new FormControl('', [Validators.required, Validators.email]),
    supDob: new FormControl('', Validators.required),
    supJoined: new FormControl('', Validators.required),
    supPassword: new FormControl('', Validators.required),
    supConfirmPassword: new FormControl('', Validators.required),
  });

  // NOTE: Dead endpoint — '/super-admin' route does not exist on backend
  // getAdmin() {
  //   return this.http.get<SuperAdmin[]>('https://stellar-button-437607-n8.el.r.appspot.com/super-admin ');
  // }

  // NOTE: Dead endpoint — '/super-admin' POST route does not exist on backend
  // postAdmin(data) {
  //   return this.http.post<SuperAdmin>('https://stellar-button-437607-n8.el.r.appspot.com/super-admin ', data);
  // }

  // NOTE: Dead endpoint — '/coveringEmp' route does not exist on backend
  // postCoveringEmployee(data) {
  //   return this.http.post("https://stellar-button-437607-n8.el.r.appspot.com/coveringEmp", data);
  // }

  // NOTE: Dead endpoint — '/coveringEmp/:id' PUT route does not exist on backend
  // putCoveringEmployee(data) {
  //   return this.http.put("https://stellar-button-437607-n8.el.r.appspot.com/coveringEmp" + '/' + data.id, data);
  // }

  uploadPolicies(data) {
    const formData = new FormData();
    formData.append("policy", data);
    return this.http.post(`${environment.apiUrl}/policy/addpolicy?hr_key=62bd553f463149f102b33300`, formData);
  }

  getPolicies() {
    return this.http.get<Policy[]>(`${environment.apiUrl}/policy/getpolicies`);
  }

  downloadPolicy(id) {
    return this.http.get(`${environment.apiUrl}/policy/downloadpolicy/${id}`);
  }

  removePolicy(data) {
    return this.http.post(`${environment.apiUrl}/policy/remove`, data);
  }
}
