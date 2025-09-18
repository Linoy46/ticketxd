import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedBreadCrumbComponent } from './shared-bread-crumb.component';

describe('SharedBreadCrumbComponent', () => {
  let component: SharedBreadCrumbComponent;
  let fixture: ComponentFixture<SharedBreadCrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedBreadCrumbComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SharedBreadCrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
