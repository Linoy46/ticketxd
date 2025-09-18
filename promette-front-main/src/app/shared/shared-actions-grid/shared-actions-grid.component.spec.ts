import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedActionsGridComponent } from './shared-actions-grid.component';

describe('SharedActionsGridComponent', () => {
  let component: SharedActionsGridComponent;
  let fixture: ComponentFixture<SharedActionsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedActionsGridComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SharedActionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
