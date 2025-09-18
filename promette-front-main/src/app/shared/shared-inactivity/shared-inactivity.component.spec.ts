import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedInactivityComponent } from './shared-inactivity.component';

describe('SharedInactivityComponent', () => {
  let component: SharedInactivityComponent;
  let fixture: ComponentFixture<SharedInactivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedInactivityComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SharedInactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
