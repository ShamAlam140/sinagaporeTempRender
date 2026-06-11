import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesReportingComponent } from './employees-reporting.component';

describe('EmployeesReportingComponent', () => {
  let component: EmployeesReportingComponent;
  let fixture: ComponentFixture<EmployeesReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
