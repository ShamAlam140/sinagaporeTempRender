import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LeaveRecord } from '../models/leave-record.modal';

@Injectable({
  providedIn: 'root'
})
export class LeaveRecordService {

  constructor(private http: HttpClient) { }

  getLeaveRecord() {
    return this.http.get<LeaveRecord[]>(`${environment.apiUrl}/leavereport/getleaves`);
  }

  addLeaveRecord(data) {
    return this.http.post(`${environment.apiUrl}/leavereport/addleave?hr_key=62bd553f463149f102b33300`, data);
  }

  updateLeaveRecord(data, id) {
    return this.http.post(`${environment.apiUrl}/leavereport/update?id=${id}`, data);
  }

  deleteLeaveRecord(data) {
    return this.http.post(`${environment.apiUrl}/leavereport/removeleave`, data);
  }
}
