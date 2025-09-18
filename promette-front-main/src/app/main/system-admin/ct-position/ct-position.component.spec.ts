import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtPositionComponent } from './ct-position.component';

describe('CtPositionComponent', () => {
  let component: CtPositionComponent;
  let fixture: ComponentFixture<CtPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
