import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocationsComponent } from './convocations.component';

describe('ConvocationsComponent', () => {
  let component: ConvocationsComponent;
  let fixture: ComponentFixture<ConvocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvocationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
