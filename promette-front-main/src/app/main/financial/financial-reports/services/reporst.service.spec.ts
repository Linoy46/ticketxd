import { TestBed } from '@angular/core/testing';

import { ReporstService } from './reporst.service';

describe('ReporstService', () => {
  let service: ReporstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
