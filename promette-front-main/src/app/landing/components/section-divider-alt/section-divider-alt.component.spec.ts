import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDividerALTComponent } from './section-divider-alt.component';

describe('SectionDividerALTComponent', () => {
  let component: SectionDividerALTComponent;
  let fixture: ComponentFixture<SectionDividerALTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDividerALTComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionDividerALTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
