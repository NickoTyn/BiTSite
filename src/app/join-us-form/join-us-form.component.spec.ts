import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinUsFormComponent } from './join-us-form.component';

describe('JoinUsFormComponent', () => {
  let component: JoinUsFormComponent;
  let fixture: ComponentFixture<JoinUsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinUsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JoinUsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
