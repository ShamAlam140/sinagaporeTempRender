import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { LogOutComponent } from '../log-out/log-out.component';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currUser;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getUsername();
  }

  getUsername(){
    this.currUser = JSON.parse(localStorage.getItem('manager'));
  }

  logout(){
    const dialogRef = this.dialog.open(LogOutComponent, {
      width: '30%',
      height: '150px'
    });
  }

}
