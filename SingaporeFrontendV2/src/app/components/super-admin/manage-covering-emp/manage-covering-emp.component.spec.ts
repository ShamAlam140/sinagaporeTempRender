import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCoveringEmpComponent } from './manage-covering-emp.component';

describe('ManageCoveringEmpComponent', () => {
  let component: ManageCoveringEmpComponent;
  let fixture: ComponentFixture<ManageCoveringEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCoveringEmpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCoveringEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
