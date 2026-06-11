export class Certificate{
    _id: string;
    longUrl: string;
    multi: [];
    name: string;

    constructor(certificate) {
        this._id = certificate._id;
        this.longUrl = certificate.longUrl;
        this.multi = certificate.multi;
        this.name = certificate.name;
    }
}