import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedCustomModalComponent } from './shared-custom-modal.component';

describe('SharedCustomModalComponent', () => {
  let component: SharedCustomModalComponent;
  let fixture: ComponentFixture<SharedCustomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedCustomModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SharedCustomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
