import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrespondenceComponent } from './correspondence.component';

describe('CorrespondenceComponent', () => {
  let component: CorrespondenceComponent;
  let fixture: ComponentFixture<CorrespondenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrespondenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
