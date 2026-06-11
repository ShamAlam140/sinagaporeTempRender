import { Cover } from './../../models/cover.modal';
import { EmployeeService } from './../../services/employee.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-covering-task',
  templateUrl: './covering-task.component.html',
  styleUrls: ['./covering-task.component.css']
})
export class CoveringTaskComponent implements OnInit {
  coveringData = [];
  currUser;

  constructor(private empService: EmployeeService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.currentUser();
    this.getCoverTask();
  }

  currentUser(){
    this.currUser = JSON.parse(localStorage.getItem('employee'));
  }

  getCoverTask(){
    this.coveringData = [];
    this.empService.getCoverData().subscribe((res: Cover[])=>{
      res.forEach(cover=>{
        if(cover.empName === this.currUser.empName){
          this.coveringData.push(cover);
        }
      })
    })
  }

  deleteEntry(id){
    this.empService.deleteCover(id).subscribe(res=>{
      this.getCoverTask();
      this.showNotification(
        'snackbar-danger',
        'Entry Delete!',
        'bottom',
        'center'
      );
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
