import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LeaveDialogComponent } from './../leave-dialog/leave-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Leaves } from './../../models/leave.modal';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HolidayService } from '../../services/holiday.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../services/employee.service';
import readXlsxFile from 'read-excel-file'
import { LeaveRecord } from '../../models/leave-record.modal';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LeaveRecordService } from '../../services/leave-record.service';
import * as XLSX from 'xlsx';

@Component({
  standalone: false,
  selector: 'app-upload-leave',
  templateUrl: './upload-leave.component.html',
  styleUrls: ['./upload-leave.component.scss'],
})
export class UploadLeaveComponent implements OnInit {
  leaveFlag: boolean = false;
  leaves: Leaves[] = [];
  excelFlag: boolean = false;
  leaveDetails: any[] = [];
  showExcelTable: boolean = false;
  showLeaveHistory: boolean = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  searchKey: string;
  dataSource: MatTableDataSource<any>;
  displayedColumns = ["srno", "staff", "previous", "current", "total", "utilised", "remaining", "sick", "sickUtilised", "sickRemaining","hospitalization","hospitalizationUtilised","hospitalizationRemaining"];

  oldleavecount = 0;
  currYear;

  leaveHistory: LeaveRecord[] = [];

  addLeaveForm: FormGroup = new FormGroup({
    type: new FormControl('', Validators.required),
    count: new FormControl(null, Validators.required),
    year: new FormControl('')
  })

  constructor(
    private holidayService: HolidayService, 
    private dialog: MatDialog, 
    private snackbar: MatSnackBar,
    private empService: EmployeeService,
    private leaveService: LeaveRecordService
    ) {}

  ngOnInit(): void {
    this.currYear = new Date().getFullYear();
    this.getLeaves();
    this.getLeaveRecords();
    this.excelFlag = true;
  }

  getLeaveRecords(){
    this.holidayService.getEmployees().subscribe(res=>{
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    })
  }

  deleteLeaveRecord(leave){
    let body = { id: leave._id }; console.log(body);
    this.leaveService.deleteLeaveRecord(body).subscribe(res=>{
      this.getLeaveRecords();
      this.showNotification(
        'snackbar-success',
        'Leave Record Deleted!',
        'bottom',
        'center'
      );
    })
  }

  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  }

  exportExcel(): void{
    let element = document.getElementById('excel-data');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, `Leave-History.xlsx`);
  }

  applyFilter(){
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  addLeaves(data){
    let date = new Date();
    data.year = date.getFullYear(); console.log(data);
    this.holidayService.addLeave(data).subscribe(res=>{
      this.empService.getEveryEmployees().subscribe(res=>{
        res.forEach(emp=>{
          data.remaining = data.count;
          this.empService.uploadLeaveType(data, emp._id).subscribe();
        })
      })
      this.addLeaveForm.reset();
      this.getLeaves();
      this.leaveFlag = false;
      this.showNotification(
        'snackbar-success',
        'Leave Uploaded!',
        'bottom',
        'center'
      );
    })
  }

  getLeaves(){
    let date = new Date();
    this.holidayService.getEmployees().subscribe(res=>{
      console.log(res);
      this.leaves = res
    })
  }

  uploadExcel(e){
    let fileReaded: any;
    fileReaded = e.target.files[0];
    let type = e.target.files[0].name.split('.').pop();
    this.leaveDetails = [];
    const schema = {
      'Staff': {
        prop: 'staff',
        type: String,
        required: false
      },
      'Previous': {
        prop: 'previous',
        type: Number,
        required: false
      },
      'Current': {
        prop: 'current',
        type: Number,
        required: false
      },
      'Total': {
        prop: 'total',
        type: Number,
        required: false
      },
      'Utilised': {
        prop: 'utilised',
        type: Number,
        required: false
      },
      'Remaining': {
        prop: 'remaining',
        type: Number,
        required: false
      },
      'Sick/Casual': {
        prop: 'sick/casual',
        type: Number,
        required: false
      },
      'SickUtilised': {
        prop: 'sickUtilised',
        type: Number,
        required: false
      },
      'SickRemaining': {
        prop: 'sickRemaining',
        type: Number,
        required: false
      },
    };

    readXlsxFile(e.target.files[0],{schema}).then((data)=>{
      console.log(data);
      if(data.rows){
        this.showExcelTable = true;
        for(let i of data.rows){
          this.leaveDetails.push(i);
        }
      }
    })
  }

  uploadLeave(leave, i){
    this.leaveService.getLeaveRecord().subscribe(res=>{
      let checkDataAvailable = res.filter(x => x.staff === leave.staff);
      if(checkDataAvailable.length !== 0){
        const body = { previous: leave.previous, current: leave.current, total: leave.total, 
          utilised: leave.utilised, remaining: leave.remaining, sick: leave.sick, 
          sickUtilised: leave.sickUtilised, sickRemaining: leave.sickRemaining };
        this.leaveService.updateLeaveRecord(body, checkDataAvailable[0]._id).subscribe(res=>{
          this.getLeaveRecords();
        });
      }
      else{
        let body = { staff: leave.staff, previous: leave.previous, current: leave.current, total: leave.total, 
          utilised: leave.utilised, remaining: leave.remaining, sick: leave.sick, 
          sickUtilised: leave.sickUtilised, sickRemaining: leave.sickRemaining };
        this.leaveService.addLeaveRecord(body).subscribe(res=>{
          this.getLeaveRecords();
        });
      }
    })

    let currYear = new Date().getFullYear();
    leave.year = currYear; console.log(leave);
    this.empService.getEveryEmployees().subscribe(res=>{
      res.forEach(emp=>{
        if(emp.empEmail === leave.staff){
          let sick = emp.leaveType.filter(x => x.type === 'Sick');
          let currSick = sick.filter(x => x.year === currYear);
          if(currSick.length !== 0){
            currSick[0].count = leave.sick
            currSick[0].remaining = leave.sickRemaining; console.log(currSick[0]);
            let countBody = { id: emp._id, tid: currSick[0].tid, count: currSick[0].count };
            let remainBody = { id: emp._id, tid: currSick[0].tid, remaining: currSick[0].remaining };
            this.empService.updatedLeaveCount(countBody).subscribe(res=>{
              this.empService.updatedLeaveRemaining(remainBody).subscribe(res=>{
                this.leaveDetails.splice(i, 1);
                this.showNotification(
                  'snackbar-success',
                  'Leave Uploaded!',
                  'bottom',
                  'center'
                );
              })
            })
          }
          else{
            let body = { type: 'Sick', count: leave.sick, year: currYear, remaining: leave.sickRemaining };
            this.empService.uploadLeaveType(body, emp._id).subscribe(res=>{
              this.leaveDetails.splice(i, 1);
              this.showNotification(
                'snackbar-success',
                'Leave Uploaded!',
                'bottom',
                'center'
              );
            });
          }

          let annual = emp.leaveType.filter(x => x.type === 'Annual')
          let currAnnual = annual.filter(x => x.year === currYear);
          let previousAnnual = annual.filter(x => x.year === currYear-1);

          if(currAnnual.length === 0){
            let body = { type: 'Annual', count: leave.total, year: currYear, remaining: leave.remaining };
            this.empService.uploadLeaveType(body, emp._id).subscribe();
          }
          else{
            let countbody = { id: emp._id, tid: currAnnual[0].tid, count: leave.total };
            let remaininbody = { id: emp._id, tid: currAnnual[0].tid, remaining: leave.remaining };
            this.empService.updatedLeaveCount(countbody).subscribe(res=>{
              this.empService.updatedLeaveRemaining(remaininbody).subscribe()
            })
          }
        }
      })
    })

    //       // if(previousAnnual.length === 0){
    //       //   let body = { type: 'Annual', count: leave.previous, year: currYear-1, remaining: leave.previous };
    //       //   this.empService.uploadLeaveType(body, emp._id).subscribe();
    //       // }
    //       // else{
    //       //   let countbody = { id: emp._id, tid: previousAnnual[0].tid, count: leave.previous };
    //       //   let remaininbody = { id: emp._id, tid: previousAnnual[0].tid, remaining: leave.previous };
    //       //   this.empService.updatedLeaveCount(countbody).subscribe(res=>{
    //       //     this.empService.updatedLeaveRemaining(remaininbody).subscribe()
    //       //   })
    //       // }
  



    // this.holidayService.addLeave(leave).subscribe(res=>{
    //   this.empService.getEveryEmployees().subscribe(res=>{
    //     res.forEach(emp=>{
    //       leave.remaining = leave.count;
    //       leave.year = currYear;
    //       this.empService.uploadLeaveType(leave, emp._id).subscribe();
    //     })
    //   })
    //   this.leaveDetails.splice(i,1);
    //   this.addLeaveForm.reset();
    //   this.getLeaves();
    //   this.showNotification(
    //     'snackbar-success',
    //     'Leave Uploaded!',
    //     'bottom',
    //     'center'
    //   );
    // })
  }

  uploadAllLeaves(){
    console.log(this.leaveDetails);
    let currYear = new Date().getFullYear();
    this.leaveDetails.forEach(leave=>{
      this.leaveService.getLeaveRecord().subscribe(res=>{
        let checkDataAvailable = res.filter(x => x.staff === leave.staff);
        if(checkDataAvailable.length !== 0){
          const body = { previous: leave.previous, current: leave.current, total: leave.total, 
            utilised: leave.utilised, remaining: leave.remaining, sick: leave.sick, 
            sickUtilised: leave.sickUtilised, sickRemaining: leave.sickRemaining };
          this.leaveService.updateLeaveRecord(body, checkDataAvailable[0]._id).subscribe(res=>{
            this.getLeaveRecords();
          });
        }
        else{
          let body = { staff: leave.staff, previous: leave.previous, current: leave.current, total: leave.total, 
            utilised: leave.utilised, remaining: leave.remaining, sick: leave.sick, 
            sickUtilised: leave.sickUtilised, sickRemaining: leave.sickRemaining };
          this.leaveService.addLeaveRecord(body).subscribe(res=>{
            this.getLeaveRecords();
          });
        }
      })

      this.empService.getEveryEmployees().subscribe(res=>{
        res.forEach(emp=>{
          if(emp.empEmail === leave.staff){
            let sick = emp.leaveType.filter(x => x.type === 'Sick');
            let currSick = sick.filter(x => x.year === currYear);
            if(currSick.length !== 0){
              currSick[0].count = leave.sick
              currSick[0].remaining = leave.sickRemaining; console.log(currSick[0]);
              let countBody = { id: emp._id, tid: currSick[0].tid, count: currSick[0].count };
              let remainBody = { id: emp._id, tid: currSick[0].tid, remaining: currSick[0].remaining };
              this.empService.updatedLeaveCount(countBody).subscribe(res=>{
                this.empService.updatedLeaveRemaining(remainBody).subscribe(res=>{
                  
                })
              })
            }
            else{
              let body = { type: 'Sick', count: leave.sick, year: currYear, remaining: leave.sickRemaining };
              this.empService.uploadLeaveType(body, emp._id).subscribe(res=>{
                
              });
            }

            let annual = emp.leaveType.filter(x => x.type === 'Annual')
            let currAnnual = annual.filter(x => x.year === currYear);
            let previousAnnual = annual.filter(x => x.year === currYear-1);

            if(currAnnual.length === 0){
              let body = { type: 'Annual', count: leave.total, year: currYear, remaining: leave.remaining };
              this.empService.uploadLeaveType(body, emp._id).subscribe();
            }
            else{
              let countbody = { id: emp._id, tid: currAnnual[0].tid, count: leave.total };
              let remaininbody = { id: emp._id, tid: currAnnual[0].tid, remaining: leave.remaining };
              this.empService.updatedLeaveCount(countbody).subscribe(res=>{
                this.empService.updatedLeaveRemaining(remaininbody).subscribe()
              })
            }
          }
        })
        this.leaveDetails = [];
        this.showExcelTable = false;
        this.showNotification(
          'snackbar-success',
          'Leave Uploaded!',
          'bottom',
          'center'
        );
      })
    })
    // this.leaveDetails.forEach(leave=>{
    //   let any = { type: leave.type, count: leave.count, year: currYear };
    //   console.log(any);
    //   this.holidayService.addLeave(any).subscribe(res=>{
    //     this.empService.getEveryEmployees().subscribe(res=>{
    //       res.forEach(emp=>{
    //         leave.remaining = leave.count;
    //         leave.year = currYear
    //         this.empService.uploadLeaveType(leave, emp._id).subscribe();
    //       })
    //     })
    //     this.addLeaveForm.reset();
    //     this.getLeaves();
    //     this.excelFlag = false;
    //     this.leaveFlag = false;
    //     this.showNotification(
    //       'snackbar-success',
    //       'Leave Uploaded!',
    //       'bottom',
    //       'center'
    //     );
    //   })
    // })
    
  }

  deleteLeave(leave){
    console.log(leave);
    let id = { id: leave._id }
    this.holidayService.deleteLeave(id).subscribe(res=>{
      this.getLeaves();
      this.empService.getEveryEmployees().subscribe(res=>{
        res.forEach(emp=>{
          emp.leaveType.forEach(leaveType=>{
            if(leaveType.type === leave.type){
              let body = { id: emp._id, tid: leaveType.tid };
              this.empService.deleteLeaveType(body).subscribe()
            }
          })
        })
      })
      this.showNotification(
        'snackbar-danger',
        'Leave Type Deleted!',
        'bottom',
        'center'
      );
    })
  }

  editLeaveCount(leave){
    this.oldleavecount = leave.count;
    const dialogRef = this.dialog.open(LeaveDialogComponent,{
      data: leave,
      width: "30%",
      height: "220px"
    })
    dialogRef.afterClosed().subscribe(res=>{
      let currYear = new Date().getFullYear();
      if(res !== 1){
        this.getLeaves();
        let diff;
        let big;
        const count = res.count
        if(res.count > this.oldleavecount){
          big = true;
          diff = res.count - this.oldleavecount;
        }
        else if(res.count <= this.oldleavecount ){
          big = false;
          diff = this.oldleavecount - res.count;
        }
        this.empService.getEveryEmployees().subscribe(res=>{
          res.forEach(emp=>{
            emp.leaveType.forEach(leaveType =>{
              if(leaveType.year === currYear){
                if(leaveType.type === leave.type){
                  let data = { id: emp._id, tid: leaveType.tid, count: count }
                  console.log(data);
                  this.empService.updatedLeaveCount(data).subscribe();
                  let remain
                  if(big === true){
                    remain = leaveType.remaining + diff;
                  }
                  else if(big === false){
                    remain = leaveType.remaining - diff;
                  }
                  if(remain < 0){
                    remain = 0;
                  }
                  let body = { id: emp._id, tid: leaveType.tid, remaining: remain };
                  this.empService.updatedLeaveRemaining(body).subscribe();
                }
              }
            })
          })
        })
        
        this.showNotification(
          'snackbar-success',
          'Count Updated!',
          'bottom',
          'center'
        );
      }
    })
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackbar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
