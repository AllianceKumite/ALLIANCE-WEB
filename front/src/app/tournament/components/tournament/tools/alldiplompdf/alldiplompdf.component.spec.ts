import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlldiplompdfComponent } from './alldiplompdf.component';

describe('AlldiplompdfComponent', () => {
  let component: AlldiplompdfComponent;
  let fixture: ComponentFixture<AlldiplompdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlldiplompdfComponent]
    });
    fixture = TestBed.createComponent(AlldiplompdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
