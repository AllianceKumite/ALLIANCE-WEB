import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantClubInfoComponent } from './participant-club-info.component';

describe('ParticipantClubInfoComponent', () => {
  let component: ParticipantClubInfoComponent;
  let fixture: ComponentFixture<ParticipantClubInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantClubInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantClubInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
