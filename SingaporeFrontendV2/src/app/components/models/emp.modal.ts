export class EMP{
    _id: string;
    empName: string;
    empUserName: string;
    empEmail: string;
    empPassword: string;
    empJoined: string;
    empDob: string;
    leave: [{ certificate: string, count: number, fromDate: string, toDate: string,  stage  : string, pcount  : number , pcreason: string, status: string, type: string, empName: string,coveringofficer : any, empId: string, tid: string, reportingManager1: any, reportingManager2: any, approve1: boolean, approve2: boolean }];
    leaveType: [{ tid: string, type: string, count: number, year: number, remaining: number }];
    notification: [{leaveTitle: string, leaveDescription: string}];
    allCoveringEmployees: [{_id: string, name: string}];
    coveringEmployees: any[];
    cover: [{_id: string, name: string}];
    reportingManager: any[];
    totalLeaves: number;

    constructor(emp){
        this._id = emp._id;
        this.empName = emp.empName;
        this.empUserName = emp.empUserName;
        this.empPassword = emp.empPassword;
        this.empEmail = emp.empEmail;
        this.empDob = emp.empDob;
        this.empJoined = emp.empJoined;
        this.leave = emp.leave;
        this.leaveType = emp.leaveType;
        this.notification = emp.notification || [];
        this.allCoveringEmployees = emp.allCoveringEmployees || [];
        this.coveringEmployees = emp.coveringEmployees || [];
        this.cover = emp.cover;
        this.reportingManager = emp.reportingManager || [];
        this.totalLeaves = emp.totalLeaves;
    }
}