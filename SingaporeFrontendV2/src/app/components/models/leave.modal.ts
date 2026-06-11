export class Leaves{
    _id: string;
    type: string;
    count: number;
    year: number

    constructor(leave){
        this._id = leave._id;
        this.type = leave.type;
        this.count = leave.count;
        this.year = leave.year;
    }
}