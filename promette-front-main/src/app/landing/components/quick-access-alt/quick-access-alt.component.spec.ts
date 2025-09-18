import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessAltComponent } from './quick-access-alt.component';

describe('QuickAccessAltComponent', () => {
  let component: QuickAccessAltComponent;
  let fixture: ComponentFixture<QuickAccessAltComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAccessAltComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickAccessAltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
