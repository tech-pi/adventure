import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiSliderComponent } from './pi-slider.component';

describe('PiSliderComponent', () => {
  let component: PiSliderComponent;
  let fixture: ComponentFixture<PiSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
