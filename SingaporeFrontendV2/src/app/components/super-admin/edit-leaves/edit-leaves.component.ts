import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-edit-leaves',
  templateUrl: './edit-leaves.component.html',
  styleUrls: ['./edit-leaves.component.css']
})
export class EditLeavesComponent implements OnInit {
  editLeaveToggle: any = [];
  leaveCount: number;
  leaveRemain: number;

  leaves = [];

  constructor(
    public dialogRef: MatDialogRef<EditLeavesComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private empService: EmployeeService,
    private snackbar: MatSnackBar

  ) {
    console.log(data);
  }

  ngOnInit(): void {
    let currYear = new Date().getFullYear();
    this.leaves = this.data.leaveType.filter(x => x.year === currYear)
    this.leaves.forEach(element => {
      this.editLeaveToggle.push(false);
    });


  }

  onclick(i , leave){
    this.editLeaveToggle[i] = true;
    this.leaveCount = leave.issued;
    this.leaveRemain = leave.remaining;

  }

  async addCount(count, leave , remain) {


    if (remain != leave.remaining) {

      let remainbody = {
        "leaveType.$.remaining": Number(this.leaveRemain),

      };

    await  this.empService.updateLeaveType(remainbody, this.data.empEmail, leave.tid).subscribe(res => {
      this.showNotification(
        'snackbar-success',
        'Remaining Edited',
        'bottom',
        'center'
      );
      })

    }else{
      
    }

    if (count != leave.issued) {
      console.log(count);
      let diff;
      let big: boolean;

      if (leave.issued >= count) {
        big = false;
        diff = leave.issued - count;
      }
      else if (leave.issued < count) {
        big = true;
        diff = count - leave.issued;
      }
      let countbody = { id: this.data.empEmail, tid: leave.tid, count: Number(count) };
      let remain;
      if (big === true) {
        remain = leave.remaining + diff;
      }
      else if (big === false) {
        remain = leave.remaining - diff;
      }
      if (remain < 0) {
        remain = 0;
      }

      let total;
      if (big === true) {
        total = leave.count + diff;
      }
      else if (big === false) {
        total = leave.count - diff;
      }

      if (total < 0) {
        total = 0;
      }


      let remainbody = {
        "leaveType.$.remaining": remain,

      };

      let issue = {
        "leaveType.$.issued": Number(count)
      };


      let countbo = {
        "leaveType.$.count": total,

      };


   

      await this.empService.updateLeaveType(remainbody, this.data.empEmail, leave.tid).subscribe(async res => {
        await  this.empService.updateLeaveType(issue, this.data.empEmail, leave.tid).subscribe(async res => {
          await    this.empService.updateLeaveType(countbo, this.data.empEmail, leave.tid).subscribe(res => {
            this.showNotification(
              'snackbar-success',
              'Count Edited.',
              'bottom',
              'center'
            );
          })
        })
      })

    }

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
