import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { UserService } from './components/login/services/user.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'leave-management';

  isSelected = false;
  currRoute;
  isCurrentRoute: boolean;
  validUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.getCurrentRoute();
    this.checkUser();
  }

  getCurrentRoute() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currRoute = (<NavigationEnd>event).url;
        if (this.currRoute === '/form') {
          this.isCurrentRoute = false;
        } else {
          this.isCurrentRoute = true;
        }
      }
    });
  }

  checkUser() {
    this.userService.isInvalidUser.subscribe((val) => {
      this.validUser = val; console.log(val);
    });
  }

  toggleRoute() {
    this.isCurrentRoute = !this.isCurrentRoute;
    this.getCurrentRoute();
  }
}
