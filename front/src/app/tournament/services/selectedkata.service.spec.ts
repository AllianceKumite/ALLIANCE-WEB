import { TestBed } from '@angular/core/testing';

import { SelectedkataService } from './selectedkata.service';

describe('SelectedkataService', () => {
  let service: SelectedkataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedkataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
