import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutsHistorialComponent } from './outs.historial.component';

describe('OutsHistorialComponent', () => {
  let component: OutsHistorialComponent;
  let fixture: ComponentFixture<OutsHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutsHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutsHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
