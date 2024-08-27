import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalQuestionComponent } from './additional-question.component';

describe('AdditionalQuestionComponent', () => {
  let component: AdditionalQuestionComponent;
  let fixture: ComponentFixture<AdditionalQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalQuestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdditionalQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
