export class LeaveRecord{
    _id: string;
    staff: string;
    previous: number;
    current: number;
    total: number;
    utilised: number;
    remaining: number;
    sick: number;
    sickUtilised: number;
    sickRemaining: number;

    constructor(leaveRecord) {
        this._id = leaveRecord._id;
        this.staff = leaveRecord.staff;
        this.previous = leaveRecord.previous;
        this.current = leaveRecord.current;
        this.total = leaveRecord.total;
        this.utilised = leaveRecord.utilised;
        this.remaining = leaveRecord.remaining;
        this.sick = leaveRecord.sick;
        this.sickUtilised = leaveRecord.sickUtilised;
        this.sickRemaining = leaveRecord.sickRemaining;
    }

}