import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRecognitionComponent } from './manager-recognition.component';

describe('ManagerRecognitionComponent', () => {
  let component: ManagerRecognitionComponent;
  let fixture: ComponentFixture<ManagerRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
