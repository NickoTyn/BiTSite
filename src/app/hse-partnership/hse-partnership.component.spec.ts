import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HSEPartnershipComponent } from './hse-partnership.component';

describe('HSEPartnershipComponent', () => {
  let component: HSEPartnershipComponent;
  let fixture: ComponentFixture<HSEPartnershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HSEPartnershipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HSEPartnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
