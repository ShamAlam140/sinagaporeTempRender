import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManagerService } from '../../services/manager.service';

@Component({
  standalone: false,
  selector: 'app-create-manager-dialog',
  templateUrl: './create-manager-dialog.component.html',
  styleUrls: ['./create-manager-dialog.component.css'],
})
export class CreateManagerDialogComponent implements OnInit {
  manId;

  constructor(
    public managerService: ManagerService,
    public dialogRef: MatDialogRef<CreateManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    if(data.type === 'new'){
      managerService.managerForm.reset();
    }
    else if(data.type === 'edit'){
      this.manId = data.man._id;
      let dob = new Date(data.man.managerDob);
      let joined = new Date(data.man.managerJoined);
      managerService.managerForm.get('managerName').setValue(data.man.managerName);
      managerService.managerForm.get('managerUserName').setValue(data.man.managerUserName);
      managerService.managerForm.get('managerEmail').setValue(data.man.managerEmail);
      managerService.managerForm.get('managerDob').setValue(dob.toISOString());
      managerService.managerForm.get('managerJoined').setValue(joined.toISOString());
      managerService.managerForm.get('managerPassword').setValue(data.man.managerPassword);
    }
  }

  ngOnInit(): void {}

  onSubmit(data) {

    if(this.data.type === 'new'){
      console.log(data);
      data.notification = [];
      this.managerService.postManager(data).subscribe(res=>{
        this.dialogRef.close('Added');
        this.managerService.managerForm.reset();
      })
    }

    else if(this.data.type === 'edit'){
      console.log(data, this.manId);
      this.managerService.updatemanager(data, this.manId).subscribe(res=>{
        this.dialogRef.close('updated');
      })
    }
    
  }
}
