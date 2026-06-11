import { Component, OnInit } from '@angular/core';
import { Manager } from '../../models/manager.model';
import { ManagerService } from '../../services/manager.service';

@Component({
  standalone: false,
  selector: 'app-manager-profile',
  templateUrl: './manager-profile.component.html',
  styleUrls: ['./manager-profile.component.css'],
})
export class ManagerProfileComponent implements OnInit {
  manager: Manager;

  constructor(public managerService: ManagerService) {}

  ngOnInit(): void {
    this.manager = JSON.parse(localStorage.getItem('manager'));
  }
}
