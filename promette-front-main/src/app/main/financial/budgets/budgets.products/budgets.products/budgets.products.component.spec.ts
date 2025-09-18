import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetsProductsComponent } from './budgets.products.component';

describe('BudgetsProductsComponent', () => {
  let component: BudgetsProductsComponent;
  let fixture: ComponentFixture<BudgetsProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetsProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
