import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddreportingmanagerComponent } from './addreportingmanager.component';

describe('AddreportingmanagerComponent', () => {
  let component: AddreportingmanagerComponent;
  let fixture: ComponentFixture<AddreportingmanagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddreportingmanagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddreportingmanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
