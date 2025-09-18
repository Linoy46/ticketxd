import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeUnitsComponent } from './administrative.units.component';

describe('AdministrativeUnitsComponent', () => {
  let component: AdministrativeUnitsComponent;
  let fixture: ComponentFixture<AdministrativeUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativeUnitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
