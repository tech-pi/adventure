import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  PiSlider,
  SliderMark,
} from '../pi-slider-selector-react/pi-slider-selector-data';
import { PiSliderSelector } from '../pi-slider-selector-react/pi-slider-selector-react';
import * as L from 'lodash';
@Component({
  selector: 'app-pi-slider',
  templateUrl: './pi-slider.component.html',
  styleUrls: ['./pi-slider.component.less'],
})
export class PiSliderComponent implements OnInit, AfterViewInit {
  @ViewChild('sliderSelector')
  sliderSelectorComponent?: ElementRef;
  clickStepS: Subject<() => PiSlider> = new Subject();

  mouseupS: Subject<MouseEvent> = new Subject();
  mouseup$ = this.mouseupS.asObservable();

  mousemoveS: Subject<MouseEvent> = new Subject();
  mousemove$ = this.mousemoveS.asObservable();
  @Output()
  piOnAfterChange: EventEmitter<number | number[]> = new EventEmitter();

  @HostListener('document:mouseup', ['$event'])
  mouseup(e: MouseEvent) {
    this.mouseupS.next(e);
  }

  @HostListener('document:mousemove', ['$event'])
  mousemove(e: MouseEvent) {
    this.mousemoveS.next(e);
  }

  constructor() {}
  ngAfterViewInit(): void {
    if (this.sliderSelectorComponent) {
      PiSliderSelector(
        this.sliderSelectorComponent.nativeElement,
        new Observable(),
        this.mouseupS.asObservable(),
        this.mousemoveS.asObservable()
      );
    }
  }

  ngOnInit(): void {
    // this.clickStep$ = this.clickStepS.asObservable().pipe(
    //   map((x) => x()),
    //   tap((x) =>
    //     this.piOnAfterChange.emit(
    //       x.piReverse && L.isArray(x.piModel.value)
    //         ? (x.piModel.value as number[]).reverse()
    //         : x.piModel.value
    //     )
    //   )
    // );
  }
}
