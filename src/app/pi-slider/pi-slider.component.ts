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
import { FormSelector } from '../form-selector-react/form-selector-react';

export interface ControlHandleByKBEventType {
  event: KeyboardEvent;
  type: 'min' | 'max' | 'single';
  value: number;
  piSlider: PiSlider;
}
@Component({
  selector: 'app-pi-slider',
  templateUrl: './pi-slider.component.html',
  styleUrls: ['./pi-slider.component.less'],
})
export class PiSliderComponent implements OnInit, AfterViewInit {
  @ViewChild('sliderSelector')
  sliderSelectorComponent?: ElementRef;
  @ViewChild('forForm')
  formSelectorComponent?: ElementRef;
  clickStepS: Subject<() => PiSlider> = new Subject();

  mouseupS: Subject<MouseEvent> = new Subject();

  mousemoveS: Subject<MouseEvent> = new Subject();

  keydownS: Subject<KeyboardEvent> = new Subject();

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

  @HostListener('keydown', ['$event'])
  keydown(e: KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.keydownS.next(e);
  }

  constructor() {}
  ngAfterViewInit(): void {
    if (this.sliderSelectorComponent) {
      PiSliderSelector(
        this.sliderSelectorComponent.nativeElement,
        new Observable(),
        this.mouseupS.asObservable().pipe(tap(x=>console.warn('...uppppp'))),
        this.mousemoveS.asObservable(),
        this.keydownS.asObservable()
      );
    }
    if(this.formSelectorComponent){
      FormSelector(
        this.formSelectorComponent.nativeElement
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
  // afterChange(msg:number|number[]){
  //   console.log(msg);
  // }
}
