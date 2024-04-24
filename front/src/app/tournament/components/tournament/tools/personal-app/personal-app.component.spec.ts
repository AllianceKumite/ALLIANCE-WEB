import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalAppComponent } from './personal-app.component';

describe('PersonalAppComponent', () => {
  let component: PersonalAppComponent;
  let fixture: ComponentFixture<PersonalAppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalAppComponent]
    });
    fixture = TestBed.createComponent(PersonalAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
