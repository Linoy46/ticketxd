import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalafonComponent } from './escalafon.component';

describe('EscalafonComponent', () => {
  let component: EscalafonComponent;
  let fixture: ComponentFixture<EscalafonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalafonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscalafonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
