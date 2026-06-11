export class Cover{
    id: string;
    empName: string;
    cEmpName: string;
    leave: [{type: string, count: number, fromDate: string, toDate: string, reason: string}];

    constructor(cover){
        this.id = cover.id;
        this.empName = cover.empName;
        this.cEmpName = cover.cEmpName;
        this.leave = cover.leave || [];
    }
}