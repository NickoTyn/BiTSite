import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastActivitiesCourseComponent } from './past-activities-course.component';

describe('PastActivitiesCourseComponent', () => {
  let component: PastActivitiesCourseComponent;
  let fixture: ComponentFixture<PastActivitiesCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastActivitiesCourseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PastActivitiesCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
