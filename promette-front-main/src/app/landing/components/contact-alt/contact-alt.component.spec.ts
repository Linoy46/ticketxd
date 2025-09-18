import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAltComponent } from './contact-alt.component';

describe('ContactAltComponent', () => {
  let component: ContactAltComponent;
  let fixture: ComponentFixture<ContactAltComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAltComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactAltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
