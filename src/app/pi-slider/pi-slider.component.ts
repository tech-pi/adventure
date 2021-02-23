import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { PiSliderSelector } from '../pi-slider-selector-react/pi-slider-selector-react';

@Component({
  selector: 'app-pi-slider',
  templateUrl: './pi-slider.component.html',
  styleUrls: ['./pi-slider.component.less']
})
export class PiSliderComponent implements OnInit,AfterViewInit {

  @ViewChild('sliderSelector')
  sliderSelectorComponent?: ElementRef;
  constructor() { }
  ngAfterViewInit(): void {
    if (this.sliderSelectorComponent) {
      PiSliderSelector(
        this.sliderSelectorComponent.nativeElement,
        new Observable()
      );
    }
  }

  ngOnInit(): void {
  }

}
