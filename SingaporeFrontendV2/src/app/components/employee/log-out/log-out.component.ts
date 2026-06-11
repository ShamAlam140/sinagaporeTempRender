import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.css']
})
export class LogOutComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LogOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout(){
    localStorage.removeItem('employee');
    this.dialogRef.close();
    this.router.navigateByUrl('/');
  }
}
