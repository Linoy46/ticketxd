import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNewReportComponent } from './patient-new-report.component';

describe('PatientNewReportComponent', () => {
  let component: PatientNewReportComponent;
  let fixture: ComponentFixture<PatientNewReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientNewReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientNewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
