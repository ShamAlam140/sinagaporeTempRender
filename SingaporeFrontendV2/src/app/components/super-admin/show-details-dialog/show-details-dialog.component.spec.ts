import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDetailsDialogComponent } from './show-details-dialog.component';

describe('ShowDetailsDialogComponent', () => {
  let component: ShowDetailsDialogComponent;
  let fixture: ComponentFixture<ShowDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
