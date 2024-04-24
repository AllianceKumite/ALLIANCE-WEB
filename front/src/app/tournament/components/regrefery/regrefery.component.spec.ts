import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegreferyComponent } from './regrefery.component';

describe('RegreferyComponent', () => {
  let component: RegreferyComponent;
  let fixture: ComponentFixture<RegreferyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegreferyComponent]
    });
    fixture = TestBed.createComponent(RegreferyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
