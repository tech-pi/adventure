import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PiSlider,
  SliderMark,
} from '../pi-slider-selector-react/pi-slider-selector-data';
export default new EventEmitter();
export const downTrackS: Subject<{
  event: MouseEvent;
  piSlider: PiSlider;
  slider: HTMLElement;
}> = new Subject();
export const mouseDownHandleS: Subject<MouseEvent> = new Subject();
export const keyDownHandleS: Subject<{
  event: KeyboardEvent;
  handle: object;
}> = new Subject();
export const mouseMoveHandleS: Subject<{
  event: MouseEvent;
  handle: object;
  marks: SliderMark[];
  slider: HTMLElement;
}> = new Subject();
export const focusS: Subject<{
  focus: boolean;
  handle: object;
}> = new Subject();
export function useEmitObservable<T>(): [Observable<T>, (x: T) => void] {
  const [subject] = useState<Subject<T>>(() => new Subject<T>());
  useEffect(() => {
    return () => {
      subject.complete();
    };
  }, [subject]);
  return [
    subject.asObservable(),
    (x: T) => {
      subject.next(x);
    },
  ];
}
export function useStateObservable<T>(init: T) {
  const [subject] = useState<BehaviorSubject<T>>(
    () => new BehaviorSubject<T>(init)
  );
  useEffect(() => {
    return () => {
      subject.complete();
    };
  }, [subject]);
  return [
    subject.asObservable(),
    (x: T) => {
      subject.next(x);
    },
  ];
}
