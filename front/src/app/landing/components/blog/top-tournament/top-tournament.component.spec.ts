/**
 * @author Ilya
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTournamentComponent } from './top-tournament.component';

describe('TopTournamentComponent', () => {
  let component: TopTournamentComponent;
  let fixture: ComponentFixture<TopTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopTournamentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
