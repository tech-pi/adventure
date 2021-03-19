import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { merge, Observable, Subject } from 'rxjs';
import {
  filter,
  map,
  switchAll,
  tap,
  windowToggle,
  withLatestFrom,
} from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { css, cx } from '@emotion/css';
import * as c from './pi-slider-selector-css';
import {
  initSlider,
  PiSlider,
  PiSliderDataInputType,
  SliderMark,
  SliderStyleType,
} from './pi-slider-selector-data';
import * as L from 'lodash';
import {
  changeFocus,
  click,
  controlHandleByKB,
  createSliderStyle,
  dragHandle,
  dragTrack,
  handle2Mark,
  judgePiDataValid,
} from './pi-slider-selector-logic';
import emmiter, {
  downTrackS,
  focusS,
  keyDownHandleS,
  mouseDownHandleS,
  mouseMoveHandleS,
} from '../pi-slider/events';


const $E = React.createElement;

export function PiSliderSelector(
  e: HTMLElement,
  piData: Observable<PiSliderDataInputType>,
  mouseup$: Observable<MouseEvent>,
  mousemove$: Observable<MouseEvent>,
  keydown$: Observable<KeyboardEvent>
) {
  ReactDOM.render(
    $E(() => {
      useObservable(() =>
        piData.pipe(
          tap((value) => {
            judgePiDataValid(value);
            wrappedSetPiSlider(
              piSlider.setSlider({ ...piSlider, ...value }, piSlider)
            );
          })
        )
      );
      // const down:Subject<MouseEvent>=subje
      // const downS:Subject<MouseEvent>=React.useContext(new Subject<MouseEvent>());
      const [sliderRef, setSliderRef] = useState<HTMLElement>();
      const downTrack$ = downTrackS.asObservable();
      const dragTrack$ = mousemove$.pipe(
        windowToggle(downTrack$, () => mouseup$),
        switchAll(),
        withLatestFrom(downTrack$),
        tap((x) => console.log('dragTrack', x)),
        map(([move, down]) => dragTrack(move, down))
      );
      const keyControlHandle$ = keyDownHandleS.asObservable().pipe(
        filter((x) =>
          ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(
            x.event.code
          )
        ),
        windowToggle(focusS.asObservable().pipe(filter((x) => x.focus)), () =>
          focusS.asObservable().pipe(filter((x) => !x.focus))
        ),
        switchAll(),
        map((c) => controlHandleByKB(c, piSlider))
      );
      const downHandle$ = mouseDownHandleS.asObservable();
      const dragHandle$ = mouseMoveHandleS.asObservable().pipe(
        windowToggle(downHandle$.pipe(tap((x) => console.log('...down'))), () =>
          mouseup$.pipe(tap((x) => console.log('...up')))
        ),
        switchAll(),
        withLatestFrom(downHandle$),
        tap((x) => console.log('dragHandle', x)),
        map(([move, down]) => dragHandle(move, piSlider))
      );
      const afterChangeE = (msg: number | number[]) => {
        emmiter.emit('afterChange', msg);
      }; //TODO:
        const [selected, setSelected] = useState<object | null>(null);
      const e=useObservable(() => mousemove$);
      // const down$=state((
      //   name:'down',
      //   defaultValue:nu
      // ));
      useEffect(() => {

        console.log(selected, e)
      }, [ e]);
      const [piSlider, setPiSlider] = useState<PiSlider>(PiSlider(initSlider));
      const [sliderStyle, setSliderStyle] = useState<{
        track: object;
        handle: object[];
        marks: SliderMark[];
      }>(
        createSliderStyle(
          piSlider.piVertical,
          piSlider.piReverse,
          piSlider.piMin,
          piSlider.piMax,
          piSlider.piModel,
          piSlider.piMarks,
          piSlider.piValidRange
        )
      );
      useObservable(() =>
        merge(keyControlHandle$, dragTrack$, dragHandle$).pipe(
          tap((x) => {
            wrappedSetPiSlider(x);
          })
        )
      );

      useEffect(() => {
        const afterChange = (msg: number | number[]) => {
          console.log(msg);
        };
        emmiter.addListener('afterChange', afterChange);
        return () => {
          emmiter.removeListener('afterChange', afterChange);
        };
      });

      const wrappedSetPiSlider = (piSlider: PiSlider) => {
        setPiSlider(piSlider);
        setSliderStyle(
          createSliderStyle(
            piSlider.piVertical,
            piSlider.piReverse,
            piSlider.piMin,
            piSlider.piMax,
            piSlider.piModel,
            piSlider.piMarks,
            piSlider.piValidRange
          )
        );
      };

      return PiSliderSelectorWrapper(
        piSlider,
        setSliderRef,
        sliderStyle,
        wrappedSetPiSlider,
        (event: MouseEvent) => {
          downTrackS.next({ event, piSlider, slider: sliderRef });
        },
        setSelected,
        // (event: MouseEvent, handle: object, marks: SliderMark[]) => {
        //   console.log(event, handle, marks);
        //   mouseMoveHandleS.next({ event, handle, marks, slider: sliderRef });
        // },
        afterChangeE
      );
    }),
    e
  );
}
function PiSliderSelectorWrapper(
  piSlider: PiSlider,
  setSliderRef: (ref: HTMLElement) => void,
  sliderStyle: SliderStyleType,
  setPiSlider: (piSlider: PiSlider) => void,
  downTrack: (event: MouseEvent) => void,
  // mouseMoveHandle: (
  //   event: MouseEvent,
  //   handle: object,
  //   marks: SliderMark[]
  // ) => void,
  setSelected: (value: object) => void,
  emitAfterChange: (value: number | number[]) => void
) {
  // const piRail = $E('div', {
  //   key: 'pi-slider-rail',
  //   piname: 'pi-slider-rail',
  //   className: 'pi-slider-rail ' + css(c.piSliderRail),
  // });
  const [piSliderStepRef, setPiSliderStepRef] = useState<HTMLElement>();

  const piSliderStep = PiSliderStep(
    sliderStyle.marks,
    piSlider,
    setPiSlider,
    setPiSliderStepRef
  );
  const piSliderReverse = piControlReverseSlider(
    piSlider,
    sliderStyle,
    setPiSlider,
    downTrack,
    // mouseMoveHandle,
    setSelected,
    piSliderStep,
    emitAfterChange
  );
  return $E(
    'div',
    {
      key: 'pi-slider-wrapper',
      piname: 'pi-slider-wrapper',
      className: `pi-slider ${
        piSlider.piVertical ? 'pi-slider-vertical' : ''
      } ${piSlider.piDisabled ? 'pi-slider-disabled' : ''} ${cx(
        c.piSlider,
        c.cursor,
        piSlider.piVertical ? c.piSliderVertical : '',
        piSlider.piDisabled ? c.piSliderDisabled : ''
      )}`,
      ref: (r) => {
        setSliderRef(r);
      },
      onClick: (e) =>
        setPiSlider(
          click(e.nativeEvent, piSliderStepRef, sliderStyle.marks, piSlider)
        ),
    },
    [piSliderReverse]
  );
}
function piControlReverseSlider(
  piSlider: PiSlider,
  sliderStyle: SliderStyleType,
  setPiSlider: (piSlider: PiSlider) => void,
  downTrack: (event: MouseEvent) => void,
  // mouseMoveHandle: (
  //   event: MouseEvent,
  //   handle: object,
  //   marks: SliderMark[]
  // ) => void,
  setSelected: (value: object) => void,

  piSliderStep: React.DetailedReactHTMLElement<
    {
      key: string;
      className: string;
    },
    HTMLElement
  >,
  emitAfterChange: (value: number | number[]) => void
) {
  //Rail
  const piSliderRail = $E('div', {
    key: 'pi-slider-rail',
    piname: 'pi-slider-rail',
    className: `pi-slider-rail ${cx(c.piSliderRail)}`,
  });
  //Track
  const piSliderTrack = $E('div', {
    key: 'pi-slider-track',
    piname: 'pi-slider-track',
    tabIndex: 0,
    className: `pi-slider-track  ${cx(c.piSliderTrack, c.cursor)}`,
    style: sliderStyle.track,
    onMouseDown: (e) => {
      e.stopPropagation();
      downTrack(e.nativeEvent);
    },
    onKeyDown: (e) => {
      e.preventDefault();
      setPiSlider(piSlider.controlTrackByKB(e.nativeEvent, piSlider));
    },
  });
  //handle
  const handleGroup = sliderStyle.handle.map((h, i) =>
    PiSliderHandle(
      h,
      i,
      piSlider,
      sliderStyle.marks,
      // mouseMoveHandle,

      setSelected,
      emitAfterChange
    )
  );

  return $E(
    'div',
    {
      key: 'pi-control-reverse-slider',
      piname: 'pi-control-reverse-slider',
      className: piSlider.piReverse
        ? `pi-slider-reverse ${cx(c.piSliderReverse)}`
        : '',
    },
    [piSliderRail, piSliderTrack, handleGroup, piSliderStep]
  );
}
function PiSliderHandle(
  handle: object,
  index: number,
  piSlider: PiSlider,
  marks: SliderMark[],
  // mouseMoveHandle: (
  //   event: MouseEvent,
  //   handle: object,
  //   marks: SliderMark[]
  // ) => void,
  setSelected: (value: object) => void,

  emitAfterChange: (value: number | number[]) => void
) {
  const [showHandleTooltip, setShowHandleTooltip] = useState<boolean>(false);
  const tooltipArrowContent = $E('div', {
    key: 'tooltip-arrow-content' + index,
    className: 'tooltip-arrow-content',
  });
  const piTooltipArrow = $E(
    'div',
    {
      key: 'pi-tooltip-arrow' + index,
      className: 'pi-tooltip-arrow',
    },
    tooltipArrowContent
  );
  const handleTitle = $E(
    'div',
    {
      key: 'handle-title' + index,
      className: `handle-title handle-title-placement-${
        piSlider.piTooltipPlacement
      } ${cx(
        c.handleTitle,
        c[`handleTitlePlacement${L.capitalize(piSlider.piTooltipPlacement)}`]
      )}`,
      hidden:
        piSlider.piTooltipVisible !== 'always' &&
        (piSlider.piTooltipVisible === 'never' || !showHandleTooltip),
    },
    [L.round(handle['value'], 2), piTooltipArrow]
  );
  return $E(
    'div',
    {
      key: 'pi-slider-handle' + index,
      className: `pi-slider-handle ${cx(c.cursor, c.piSliderHandle)}`,
      tabIndex: 0,
      style: handle['style'],
      onMouseEnter: () => setShowHandleTooltip(true),
      onMouseLeave: () => setShowHandleTooltip(false),
      onClick: (e) => e.stopPropagation(),
      onFocus: () => {
        console.log('focus');
        focusS.next({ focus: true, handle });
        changeFocus(true, piSlider.piDisabled, emitAfterChange);
      },
      onBlur: () => {
        console.log('blur');
        focusS.next({ focus: false, handle });
        changeFocus(
          false,
          piSlider.piDisabled,
          emitAfterChange,
          piSlider.piModel.value,
          piSlider.piReverse
        );
      },
      onMouseDown: (e) => {
        setSelected(handle);
        // mouseDownHandleS.next(e.nativeEvent);
      },
      onKeyDown: (e) => {
        console.log('down');
        keyDownHandleS.next({ event: e.nativeEvent, handle });
      },
      onMouseMove: (e) => {
        // mouseMoveHandle(e.nativeEvent, handle, marks);
        // console.warn('move', e);
      },
    },
    handleTitle
  );
}
function PiSliderStep(
  sliderMarks: SliderMark[],
  piSlider: PiSlider,
  setPiSlider: (piSlider: PiSlider) => void,
  setPiSliderStepRef: (ref: HTMLElement) => void
) {
  const handle2MarkF = (event: Event, value: number) => {
    event.stopImmediatePropagation();
    setPiSlider(handle2Mark(event, value, piSlider));
  };
  const piSliderDots = sliderMarks.map((mark, index) =>
    PiSliderDot(mark, index, handle2MarkF)
  );
  const marks = sliderMarks.map((mark, index) =>
    PiSliderMarkText(mark, index, handle2MarkF)
  );
  const piSliderMark = $E(
    'div',
    {
      key: `pi-slider-mark`,
      piname: `pi-slider-mark`,
      className: `pi-slider-mark `,
    },
    marks
  );
  return $E(
    'div',
    {
      key: 'pi-slider-step',
      className: `pi-slider-step ${cx(c.piSliderStep)}`,
      ref: (r) => {
        setPiSliderStepRef(r);
      },
    },
    [piSliderDots, piSliderMark]
  );
}
function PiSliderDot(
  markData: SliderMark,
  index: number,
  handle2MarkF: (event: Event, value: number) => void
) {
  return $E('div', {
    key: 'pi-slider-dot' + index,
    className: `pi-slider-dot ${
      markData.isActive ? 'pi-slider-dot-active ' : ''
    } ${c.cursor}`,
    style: markData.dot,

    onClick: (e) => handle2MarkF(e.nativeEvent, markData.value),
  });
}
function PiSliderMarkText(
  mark: SliderMark,
  index: number,
  handle2MarkF: (event: Event, value: number) => void
) {
  function createHTML(label: string | HTMLElement) {
    return { __html: label };
  }
  return $E('span', {
    key: `pi-slider-mark-text-${index}`,
    piname: `pi-slider-mark-text-${index}`,
    className: `pi-slider-mark-text ${c.cursor}`,
    style: mark.mark,
    dangerouslySetInnerHTML: createHTML(mark.label),

    onClick: (e) => handle2MarkF(e.nativeEvent, mark.value),
  });
}
