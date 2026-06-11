import { environment } from 'src/environments/environment';
import { EMP } from 'src/app/components/models/emp.modal';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(public http: HttpClient) { }

  applyLeaveForm: FormGroup = new FormGroup({
    range: new FormGroup({
      fromDate: new FormControl('', Validators.required),
      toDate: new FormControl('', Validators.required),
    }),
    leaveType: new FormControl('', Validators.required),
    leaveReason: new FormControl('', Validators.required),
  });


  applyLeave(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/applyleave?id=${id}`, data)
  }





  coveringEmpForm: FormGroup = new FormGroup({
    coveringEmp1: new FormControl('', Validators.required),
    coveringEmp2: new FormControl('', Validators.required),
    coveringEmp3: new FormControl('')
  })

  coveringEmployeeForm: FormGroup = new FormGroup({
    coveringEmp1: new FormControl('', Validators.required),
    coveringEmp2: new FormControl('')
  })

  userForm: FormGroup = new FormGroup({
    empName: new FormControl('', Validators.required),
    empUserName: new FormControl('', Validators.required),
    empEmail: new FormControl('', [Validators.required, Validators.email]),
    empPassword: new FormControl('', Validators.required),
    empDob: new FormControl('', Validators.required),
    empJoined: new FormControl('', Validators.required)
  });

  getAllEmployees() {
    return this.http.get<Employee[]>(`${environment.apiUrl}/employee/getEmployee?hr_key=62bd553f463149f102b33300`);
  }

  getEveryEmployees() {
    return this.http.get<EMP[]>(`${environment.apiUrl}/employee/getEmployee?hr_key=62bd553f463149f102b33300`);
  }

  updateEmployee(id, data) {
    return this.http.post(`${environment.apiUrl}/employee/additional?id=${id}`, data);
  }

  getEmployees(id) {
    return this.http.get<EMP>(`${environment.apiUrl}/employee/details?id=${id}`);
  }

  // NOTE: This method is unused/dead — no matching backend route exists.
  // Kept commented for reference. Remove when confirmed unnecessary.
  // addEmployees(data) {
  //   return this.http.put<Employee>(`${environment.apiUrl}/employee/` + data.id, data);
  // }

  postEmployee(data) {
    return this.http.post<EMP>(`${environment.apiUrl}/employee/addemployee?hr_key=62bd553f463149f102b33300`, data);
  }

  // NOTE: This method is unused/dead — no matching backend route exists.
  // getEmpToCover() {
  //   return this.http.get<[]>("https://stellar-button-437607-n8.el.r.appspot.com/coveringEmp");
  // }

  postCoverData(data) {
    return this.http.post(`${environment.apiUrl}/covers/addcovers?hr_key=62bd553f463149f102b33300`, data);
  }

  getCoverData() {
    return this.http.get<[]>(`${environment.apiUrl}/covers/getallcovers`);
  }

  deleteCover(id) {
    let data = { id: id }
    return this.http.post(`${environment.apiUrl}/covers/removecover`, data);
  }

  updateCoveringData(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/additional?id=${id}`, data)
  }

  updateCoverData(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/additional?id=${id}`, data)
  }

  updateReportingManager(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/additional?id=${id}`, data);
  }

  updateAllCoveringEmployees(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/additional?id=${id}`, data);
  }

  uploadCertificates(data): Observable<{}> {
    const formData = new FormData();
    formData.append("file", data);
    return this.http.post(`${environment.apiUrl}/upload/addfiles`, formData);
  }

  updateLeaveStatus(data) {
    return this.http.post(`${environment.apiUrl}/employee/updateleavestatus`, data);
  }

  deleteEmployee(data) {
    return this.http.post(`${environment.apiUrl}/employee/deleteemployee?hr_key=62bd553f463149f102b33300`, data);
  }

  uploadLeaveType(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/addleavetype?id=${id}`, data)
  }

  updatedLeaveCount(data) {
    return this.http.post(`${environment.apiUrl}/employee/updateleavecount`, data);
  }



  updatedLeaveRemaining(data) {
    return this.http.post(`${environment.apiUrl}/employee/updateremaining`, data);
  }

  deleteLeaveType(data) {
    return this.http.post(`${environment.apiUrl}/employee/deleteleavetype`, data);
  }

  uploadNotification(data, id) {
    return this.http.post(`${environment.apiUrl}/employee/addnotification?id=${id}`, data)
  }

  deleteNotification(data) {
    return this.http.post(`${environment.apiUrl}/employee/deletenotification`, data);
  }

  updateLeaveApprove1(data) {
    return this.http.post(`${environment.apiUrl}/employee/updateapprove1`, data);
  }

  updateLeaveApprove2(data) {
    return this.http.post(`${environment.apiUrl}/employee/updateapprove2`, data);
  }

  updateComment(data, id, sid) {
    return this.http.post(`${environment.apiUrl}/employee/updateleave/` + id + "/" + sid, data);
  }

  updateLeave(data, id, sid) {
    return this.http.post(`${environment.apiUrl}/employee/updateleave/` + id + "/" + sid, data);
  }

  updateLeaveType(data, id, sid) {
    return this.http.post(`${environment.apiUrl}/employee/updateleaveType/` + id + "/" + sid, data);
  }
  updatecount(data) {
    return this.http.post(`${environment.apiUrl}/employee/updatecount`, data);
  }

  sendEmail(data) {
    return this.http.post(`${environment.apiUrl}/email/sendmessage/`, data);
  }


}
