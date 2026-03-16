import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRecognitionComponent } from './employee-recognition.component';

describe('EmployeeRecognitionComponent', () => {
  let component: EmployeeRecognitionComponent;
  let fixture: ComponentFixture<EmployeeRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
