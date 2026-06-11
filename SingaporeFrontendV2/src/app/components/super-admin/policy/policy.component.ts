import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Policy } from '../../models/policy.modal';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  standalone: false,
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent implements OnInit {
  policyFlag: boolean = false;

  constructor(private adminService: SuperAdminService, private snackbar: MatSnackBar) {}
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

  deletePolicy(policy){
    let id = { id: policy._id };
    this.adminService.removePolicy(id).subscribe(res=>{
      this.showNotification(
        'snackbar-success',
        'Policy Removed!',
        'bottom',
        'center'
      );
      this.getPolicies();
    })
  }

  fileUpload(event) {
    console.log(event.target.files[0]);
    this.adminService.uploadPolicies(event.target.files[0]).subscribe(res=>{
      console.log(res);
      this.showNotification(
        'snackbar-success',
        'Policy Uploaded!',
        'bottom',
        'center'
      );
      this.getPolicies();
      this.policyFlag = false;
    })
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
