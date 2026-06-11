import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QdialogComponent } from './qdialog.component';

describe('QdialogComponent', () => {
  let component: QdialogComponent;
  let fixture: ComponentFixture<QdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QdialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
