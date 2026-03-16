import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAnalyticsComponent } from './manager-analytics.component';

describe('ManagerAnalyticsComponent', () => {
  let component: ManagerAnalyticsComponent;
  let fixture: ComponentFixture<ManagerAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
