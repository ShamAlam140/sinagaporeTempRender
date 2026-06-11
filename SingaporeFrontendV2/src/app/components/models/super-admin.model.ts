import { formatDate } from '@angular/common';

export class SuperAdmin {
  _id: number;
  name: string;
  email: string;
  username: string;
  dob: string;
  jdate: string;
  password: string;

  constructor(superAdmin) {
    this._id = superAdmin._id;
    this.name = superAdmin.name;
    this.email = superAdmin.email;
    this.username = superAdmin.username;
    this.password = superAdmin.password;
    this.dob = formatDate(new Date(), 'yyyy-mm-dd', 'en');
    this.jdate = formatDate(new Date(), 'yyyy-mm-dd', 'en');
  }
}
