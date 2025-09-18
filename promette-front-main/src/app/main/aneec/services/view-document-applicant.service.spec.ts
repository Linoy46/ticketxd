import { TestBed } from '@angular/core/testing';

import { ViewDocumentApplicantService } from './view-document-applicant.service';

describe('ViewDocumentApplicantService', () => {
  let service: ViewDocumentApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewDocumentApplicantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
