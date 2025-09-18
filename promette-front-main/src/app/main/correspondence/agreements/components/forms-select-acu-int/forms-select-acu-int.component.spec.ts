import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsSelectAcuIntComponent } from './forms-select-acu-int.component';

describe('FormsSelectAcuIntComponent', () => {
  let component: FormsSelectAcuIntComponent;
  let fixture: ComponentFixture<FormsSelectAcuIntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsSelectAcuIntComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsSelectAcuIntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
