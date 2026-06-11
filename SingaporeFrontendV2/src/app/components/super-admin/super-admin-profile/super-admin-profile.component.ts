import { Component, OnInit } from '@angular/core';
import { SuperAdmin } from '../../models/super-admin.model';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  standalone: false,
  selector: 'app-super-admin-profile',
  templateUrl: './super-admin-profile.component.html',
  styleUrls: ['./super-admin-profile.component.css'],
})
export class SuperAdminProfileComponent implements OnInit {
  superAdmin: SuperAdmin;

  constructor(public adminService: SuperAdminService) {}

  ngOnInit(): void {
    this.superAdmin = JSON.parse(localStorage.getItem('superadmin'));
  }

  onclick(){
    alert("Already Restarted Leaves! Now you can restart on new year");
    
  }
}
