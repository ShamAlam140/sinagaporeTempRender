export class Policy{
    _id: string;
    plink: string;
    name: string;

    constructor(policy){
        this._id = policy._id;
        this.plink = policy.plink;
        this.name = policy.name;
    }
}