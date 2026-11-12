import { TestBed } from '@angular/core/testing';
import { ContentData } from './content-data';

describe('ContentData', () => {
  let service: ContentData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
