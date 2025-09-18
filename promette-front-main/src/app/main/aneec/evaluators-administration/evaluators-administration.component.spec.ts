import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorsAdministrationComponent } from './evaluators-administration.component';

describe('EvaluatorsAdministrationComponent', () => {
  let component: EvaluatorsAdministrationComponent;
  let fixture: ComponentFixture<EvaluatorsAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluatorsAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluatorsAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
