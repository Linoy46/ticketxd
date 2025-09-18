import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleAreaComponent } from './module-area.component';

describe('ModuleAreaComponent', () => {
  let component: ModuleAreaComponent;
  let fixture: ComponentFixture<ModuleAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
