import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRhleaveComponent } from './upload-rhleave.component';

describe('UploadRhleaveComponent', () => {
  let component: UploadRhleaveComponent;
  let fixture: ComponentFixture<UploadRhleaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadRhleaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRhleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
