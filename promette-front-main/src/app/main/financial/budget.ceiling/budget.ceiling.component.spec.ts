import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetCeilingComponent } from './budget.ceiling.component';

describe('BudgetCeilingComponent', () => {
  let component: BudgetCeilingComponent;
  let fixture: ComponentFixture<BudgetCeilingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetCeilingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetCeilingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
