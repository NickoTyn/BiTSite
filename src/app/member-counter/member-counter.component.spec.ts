import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCounterComponent } from './member-counter.component';

describe('MemberCounterComponent', () => {
  let component: MemberCounterComponent;
  let fixture: ComponentFixture<MemberCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberCounterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemberCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
