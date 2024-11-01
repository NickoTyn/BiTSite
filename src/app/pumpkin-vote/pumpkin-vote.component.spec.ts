import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpkinVoteComponent } from './pumpkin-vote.component';

describe('PumpkinVoteComponent', () => {
  let component: PumpkinVoteComponent;
  let fixture: ComponentFixture<PumpkinVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PumpkinVoteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PumpkinVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
