import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachbytatamiComponent } from './coachbytatami.component';

describe('CoachbytatamiComponent', () => {
  let component: CoachbytatamiComponent;
  let fixture: ComponentFixture<CoachbytatamiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoachbytatamiComponent]
    });
    fixture = TestBed.createComponent(CoachbytatamiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
