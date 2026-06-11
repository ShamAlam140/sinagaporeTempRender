export class Covers{
    _id: string;
    name: string;

    constructor(covers){
        this._id = covers._id;
        this.name = covers.name;
    }
}