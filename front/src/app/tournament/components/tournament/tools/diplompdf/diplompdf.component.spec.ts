import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiplompdfComponent } from './diplompdf.component';

describe('DiplompdfComponent', () => {
  let component: DiplompdfComponent;
  let fixture: ComponentFixture<DiplompdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiplompdfComponent]
    });
    fixture = TestBed.createComponent(DiplompdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
