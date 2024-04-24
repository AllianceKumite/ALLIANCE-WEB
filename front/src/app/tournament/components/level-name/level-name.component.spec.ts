import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelNameComponent } from './level-name.component';

describe('LevelNameComponent', () => {
  let component: LevelNameComponent;
  let fixture: ComponentFixture<LevelNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
