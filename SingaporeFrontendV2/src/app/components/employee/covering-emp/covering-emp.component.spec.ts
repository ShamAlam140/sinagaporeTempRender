import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveringEmpComponent } from './covering-emp.component';

describe('CoveringEmpComponent', () => {
  let component: CoveringEmpComponent;
  let fixture: ComponentFixture<CoveringEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoveringEmpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoveringEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
