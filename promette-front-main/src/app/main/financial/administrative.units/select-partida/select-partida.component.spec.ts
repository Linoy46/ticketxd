import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPartidaComponent } from './select-partida.component';

describe('SelectPartidaComponent', () => {
  let component: SelectPartidaComponent;
  let fixture: ComponentFixture<SelectPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPartidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
