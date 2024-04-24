import { TestBed } from '@angular/core/testing';

import { PdfkitService } from './pdfkit.service';

describe('PdfkitService', () => {
  let service: PdfkitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfkitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
