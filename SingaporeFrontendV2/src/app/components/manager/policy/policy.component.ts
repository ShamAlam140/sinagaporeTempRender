import { Component, OnInit } from '@angular/core';
import { Policy } from '../../models/policy.modal';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  standalone: false,
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {

  constructor(private adminService: SuperAdminService) {}
  policies: Policy[] = [];

  ngOnInit(): void {
    this.getPolicies();
  }

  getPolicies(){
    this.adminService.getPolicies().subscribe(res=>{
      console.log(res);
      this.policies = res;
    })
  }

  downloadPolicy(policy){
    console.log(policy);
    this.adminService.downloadPolicy(policy._id).subscribe(res=>{
      let URL = String(res);
      window.open(URL);
    })
  }

}
