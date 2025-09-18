import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUserPositionComponent } from './form-user-position.component';

describe('FormUserPositionComponent', () => {
  let component: FormUserPositionComponent;
  let fixture: ComponentFixture<FormUserPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUserPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUserPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
