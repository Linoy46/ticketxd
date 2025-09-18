import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingObjectsComponent } from './spending.objects.component';

describe('SpendingObjectsComponent', () => {
  let component: SpendingObjectsComponent;
  let fixture: ComponentFixture<SpendingObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendingObjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendingObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
