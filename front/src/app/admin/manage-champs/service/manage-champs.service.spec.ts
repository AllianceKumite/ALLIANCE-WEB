import { TestBed } from '@angular/core/testing';

import { ManageChampsService } from './manage-champs.service';

describe('ManageChampsService', () => {
  let service: ManageChampsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageChampsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
