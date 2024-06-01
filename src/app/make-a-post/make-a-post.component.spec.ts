import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAPostComponent } from './make-a-post.component';

describe('MakeAPostComponent', () => {
  let component: MakeAPostComponent;
  let fixture: ComponentFixture<MakeAPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeAPostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MakeAPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
