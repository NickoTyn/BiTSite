import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonacoEditorWrapperComponent } from './monaco-editor-wrapper.component';

describe('MonacoEditorWrapperComponent', () => {
  let component: MonacoEditorWrapperComponent;
  let fixture: ComponentFixture<MonacoEditorWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonacoEditorWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonacoEditorWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
