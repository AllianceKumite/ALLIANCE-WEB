import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportxlsComponent } from './exportxls.component';

describe('ExportxlsComponent', () => {
  let component: ExportxlsComponent;
  let fixture: ComponentFixture<ExportxlsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportxlsComponent]
    });
    fixture = TestBed.createComponent(ExportxlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
