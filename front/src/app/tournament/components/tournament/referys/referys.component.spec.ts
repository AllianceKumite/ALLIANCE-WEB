import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferysComponent } from './referys.component';

describe('ReferysComponent', () => {
  let component: ReferysComponent;
  let fixture: ComponentFixture<ReferysComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferysComponent]
    });
    fixture = TestBed.createComponent(ReferysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
