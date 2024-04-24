import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferyBrigadeComponent } from './refery-brigade.component';

describe('ReferyBrigadeComponent', () => {
  let component: ReferyBrigadeComponent;
  let fixture: ComponentFixture<ReferyBrigadeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferyBrigadeComponent]
    });
    fixture = TestBed.createComponent(ReferyBrigadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
