import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcoverempComponent } from './addcoveremp.component';

describe('AddcoverempComponent', () => {
  let component: AddcoverempComponent;
  let fixture: ComponentFixture<AddcoverempComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddcoverempComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcoverempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
