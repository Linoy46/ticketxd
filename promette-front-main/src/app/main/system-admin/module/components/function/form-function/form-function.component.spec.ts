import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunctionComponent } from './form-function.component';

describe('FormFunctionComponent', () => {
  let component: FormFunctionComponent;
  let fixture: ComponentFixture<FormFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFunctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
