import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagefightComponent } from './managefight.component';

describe('ManagefightComponent', () => {
  let component: ManagefightComponent;
  let fixture: ComponentFixture<ManagefightComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagefightComponent]
    });
    fixture = TestBed.createComponent(ManagefightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
