export class Man{
    _id: string;
    managerDob: string
    managerEmail: string
    managerJoined: string
    managerName: string
    managerPassword: string
    managerUserName: string
    notification: []
    employeesReporting: [ { empUserName: string, empName: string, empId: string } ]

    constructor(man){
        this._id = man._id;
        this.managerDob = man.managerDob;
        this.managerEmail = man.managerEmail;
        this.managerJoined = man.managerJoined;
        this.managerName = man.managerName;
        this.managerPassword = man.managerPassword;
        this.managerUserName = man.managerUserName;
        this.employeesReporting = man.employeesReporting;
        this.notification = man.notification;
    }

}