import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedRecognitionComponent } from './received-recognition.component';

describe('ReceivedRecognitionComponent', () => {
  let component: ReceivedRecognitionComponent;
  let fixture: ComponentFixture<ReceivedRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
