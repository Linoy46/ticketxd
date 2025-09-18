import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtAreaComponent } from './ct-area.component';

describe('CtAreaComponent', () => {
  let component: CtAreaComponent;
  let fixture: ComponentFixture<CtAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
