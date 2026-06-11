export class Holiday {
  _id: string;
  start: string;
  end: string;
  title: string;

  constructor(holiday) {
    this._id = holiday._id;
    this.start = holiday.start;
    this.end = holiday.end;
    this.title = holiday.title;
  }
}
