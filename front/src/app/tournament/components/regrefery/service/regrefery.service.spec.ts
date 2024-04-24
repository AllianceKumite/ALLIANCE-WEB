import { TestBed } from '@angular/core/testing';

import { RegreferyService } from './regrefery.service';

describe('RegreferyService', () => {
  let service: RegreferyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegreferyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
