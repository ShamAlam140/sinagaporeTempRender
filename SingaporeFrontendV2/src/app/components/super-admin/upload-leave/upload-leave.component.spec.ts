import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadLeaveComponent } from './upload-leave.component';

describe('UploadLeaveComponent', () => {
  let component: UploadLeaveComponent;
  let fixture: ComponentFixture<UploadLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadLeaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
