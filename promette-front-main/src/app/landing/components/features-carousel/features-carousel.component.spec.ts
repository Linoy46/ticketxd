import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesCarouselComponent } from './features-carousel.component';

describe('FeaturesCarouselComponent', () => {
  let component: FeaturesCarouselComponent;
  let fixture: ComponentFixture<FeaturesCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
