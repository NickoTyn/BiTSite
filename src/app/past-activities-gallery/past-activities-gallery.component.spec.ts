import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastActivitiesGalleryComponent } from './past-activities-gallery.component';

describe('PastActivitiesGalleryComponent', () => {
  let component: PastActivitiesGalleryComponent;
  let fixture: ComponentFixture<PastActivitiesGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastActivitiesGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PastActivitiesGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
