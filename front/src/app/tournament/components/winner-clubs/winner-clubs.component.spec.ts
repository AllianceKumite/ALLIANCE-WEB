import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerClubsComponent } from './winner-clubs.component';

describe('WinnerClubsComponent', () => {
  let component: WinnerClubsComponent;
  let fixture: ComponentFixture<WinnerClubsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WinnerClubsComponent]
    });
    fixture = TestBed.createComponent(WinnerClubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
