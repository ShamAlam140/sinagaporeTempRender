export class CoverEmp{
    id: number;
    empName: string;
    cover: string[];

    constructor(coverEmp){
        this.id = coverEmp.id;
        this.empName = coverEmp.empName;
        this.cover = coverEmp.cover || [];
    }
}