import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardProductsComponent } from './discard-products.component';

describe('DiscardProductsComponent', () => {
  let component: DiscardProductsComponent;
  let fixture: ComponentFixture<DiscardProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscardProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
