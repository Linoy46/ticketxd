import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedAddPermissionsComponent } from './shared-add-permissions.component';

describe('SharedAddPermissionsComponent', () => {
  let component: SharedAddPermissionsComponent;
  let fixture: ComponentFixture<SharedAddPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedAddPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedAddPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
