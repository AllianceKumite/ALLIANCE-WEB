import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportdrawComponent } from './exportdraw.component';

describe('ExportdrawComponent', () => {
  let component: ExportdrawComponent;
  let fixture: ComponentFixture<ExportdrawComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportdrawComponent]
    });
    fixture = TestBed.createComponent(ExportdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
