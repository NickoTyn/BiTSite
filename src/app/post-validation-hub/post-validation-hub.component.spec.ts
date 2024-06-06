import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostValidationHubComponent } from './post-validation-hub.component';

describe('PostValidationHubComponent', () => {
  let component: PostValidationHubComponent;
  let fixture: ComponentFixture<PostValidationHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostValidationHubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostValidationHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
