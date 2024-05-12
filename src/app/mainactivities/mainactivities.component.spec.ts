import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainactivitiesComponent } from './mainactivities.component';

describe('MainactivitiesComponent', () => {
  let component: MainactivitiesComponent;
  let fixture: ComponentFixture<MainactivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainactivitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainactivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
