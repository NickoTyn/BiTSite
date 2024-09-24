import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAndCookiesComponent } from './policy-and-cookies.component';

describe('PolicyAndCookiesComponent', () => {
  let component: PolicyAndCookiesComponent;
  let fixture: ComponentFixture<PolicyAndCookiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAndCookiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolicyAndCookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
