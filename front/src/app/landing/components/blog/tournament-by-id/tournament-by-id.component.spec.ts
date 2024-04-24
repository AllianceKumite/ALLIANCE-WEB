/**
 * @author Ilya
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentByIdComponent } from './tournament-by-id.component';

describe('TournamentByIdComponent', () => {
  let component: TournamentByIdComponent;
  let fixture: ComponentFixture<TournamentByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TournamentByIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
