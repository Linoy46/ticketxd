import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAdministrationComponent } from './patient-administration.component';

describe('PatientAdministrationComponent', () => {
  let component: PatientAdministrationComponent;
  let fixture: ComponentFixture<PatientAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAdministrationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
