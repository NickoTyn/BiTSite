import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastActivitiesComponent } from './past-activities.component';

describe('PastActivitiesComponent', () => {
  let component: PastActivitiesComponent;
  let fixture: ComponentFixture<PastActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastActivitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PastActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
