import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangetatamiComponent } from './changetatami.component';

describe('ChangetatamiComponent', () => {
  let component: ChangetatamiComponent;
  let fixture: ComponentFixture<ChangetatamiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangetatamiComponent]
    });
    fixture = TestBed.createComponent(ChangetatamiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
