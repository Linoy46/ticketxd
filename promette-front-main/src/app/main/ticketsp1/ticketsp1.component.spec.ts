import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ticketsp1Component } from './ticketsp1.component';

describe('Ticketsp1Component', () => {
  let component: Ticketsp1Component;
  let fixture: ComponentFixture<Ticketsp1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ticketsp1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ticketsp1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
