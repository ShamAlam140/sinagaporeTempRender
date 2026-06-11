import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveringTaskComponent } from './covering-task.component';

describe('CoveringTaskComponent', () => {
  let component: CoveringTaskComponent;
  let fixture: ComponentFixture<CoveringTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoveringTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoveringTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
