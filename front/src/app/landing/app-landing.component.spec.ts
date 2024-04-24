import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppLandingComponent } from './app-landing.component';

describe('AppLandingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppLandingComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppLandingComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Alliance-Kumite'`, () => {
    const fixture = TestBed.createComponent(AppLandingComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Alliance-Kumite');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppLandingComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('Alliance-Kumite app is running!');
  });
});
