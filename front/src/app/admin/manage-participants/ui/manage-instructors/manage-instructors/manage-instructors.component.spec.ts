import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInstructorsComponent } from './manage-instructors.component';

describe('ManageInstructorsComponent', () => {
  let component: ManageInstructorsComponent;
  let fixture: ComponentFixture<ManageInstructorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageInstructorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageInstructorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
