import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subject } from 'rxjs';
import {
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
  createSliderStyle,
  dragTrack,
  handle2Mark,
  judgePiDataValid,
} from './pi-slider-selector-logic';
import emmiter from '../pi-slider/events';

const $E = React.createElement;

export function PiSliderSelector(
  e: HTMLElement,
  piData: Observable<PiSliderDataInputType>,
  mouseup$: Observable<MouseEvent>,
  mousemove$: Observable<MouseEvent>
) {
  ReactDOM.render(
    $E(() => {
      // const piData$ =
      useObservable(() =>
        piData.pipe(
          tap((value) => {
            judgePiDataValid(value);
            setPiSlider(
              piSlider.setSlider({ ...piSlider, ...value }, piSlider)
            );

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
          })
        )
      );
      const downTrackS: Subject<{
        event: MouseEvent;
        piSlider: PiSlider;
      }> = new Subject();
      const downTrack$ = downTrackS.asObservable();
      useObservable(() =>
        downTrack$.pipe(tap((x) => console.log('debug...', x)))
      );
      // useObservable(()=>mousemove$.pipe(tap(x=>console.log('move...',x))));
      const dragTrack$ = mousemove$.pipe(
        tap((x) => console.log('...move')),
        windowToggle(downTrack$.pipe(tap((x) => console.log('...down'))), () =>
          mouseup$.pipe(tap((x) => console.log('...up', x)))
        ),
        tap((x) => console.log('dragTrack', x)),
        switchAll(),
        withLatestFrom(downTrack$),
        map(([move, down]) => dragTrack(move, down))
      );
      useObservable(() =>
        dragTrack$.pipe(
          tap((x) => {
            console.log(x);
            setPiSlider(x);
          })
        )
      );
      const afterChangeE = (msg: number | number[]) =>
        emmiter.emit('afterChange', msg);
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
      const wrappedSetPiSlider = (piSlider: PiSlider) => {
        setPiSlider(piSlider);
      };

      console.log(piSlider, sliderStyle);
      return PiSliderSelectorWrapper(
        piSlider,
        sliderStyle,
        wrappedSetPiSlider,
        (event: MouseEvent) => {
          console.log(event);
          downTrackS.next({ event, piSlider });
        },
        afterChangeE
      );
    }),
    e
  );
}
function PiSliderSelectorWrapper(
  piSlider: PiSlider,
  sliderStyle: SliderStyleType,
  setPiSlider: (piSlider: PiSlider) => void,
  downTrack: (event: MouseEvent) => void,
  emitAfterChange:(value:number|number[])=>void
) {
  // const piRail = $E('div', {
  //   key: 'pi-slider-rail',
  //   piname: 'pi-slider-rail',
  //   className: 'pi-slider-rail ' + css(c.piSliderRail),
  // });
  // var x;
  // const stepR = React.createRef();
  const [piSliderStepRef, setPiSliderStepRef] = useState<HTMLElement>();

  const piSliderStep = PiSliderStep(
    sliderStyle.marks,
    piSlider,
    setPiSlider,
    setPiSliderStepRef
  ); //TODO:

  console.log(piSliderStepRef);
  const piSliderReverse = piControlReverseSlider(
    piSlider,
    sliderStyle,
    setPiSlider,
    downTrack,
    piSliderStep,

  emitAfterChange
  );
  // console.log(stepR,this.refs.step);
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
  piSliderStep: React.DetailedReactHTMLElement<
    {
      key: string;
      className: string;
    },
    HTMLElement
  >,

  emitAfterChange:(value:number|number[])=>void
) {
  //Rail
  const piSliderRail = $E('div', {
    key: 'pi-slider-rail',
    piname: 'pi-slider-rail',
    className: `pi-slider-rail ${cx(c.piSliderRail)}`,
  });
  console.log(c.piSliderRail);
  //Track
  // const mousedownTrackF = (e: MouseEvent) => mousedownTrack(e, piSlider);

  const piSliderTrack = $E('div', {
    key: 'pi-slider-track',
    piname: 'pi-slider-track',
    tabIndex: 0,
    className: `pi-slider-track  ${cx(c.piSliderTrack, c.cursor)}`,
    style: sliderStyle.track,
    // onClick:(e)=>{console.log('222222222',e)},
    onMouseDown: (e) => {
      console.log(e);
      e.stopPropagation();
      downTrack(e.nativeEvent);
    }, //TODO:
  });
  //handle
  const handleGroup = sliderStyle.handle.map((h, i) =>
    PiSliderHandle(h, i, piSlider, sliderStyle.marks,emitAfterChange)
  );
  //step
  // const piSliderStep = PiSliderStep(sliderStyle.marks, piSlider, setPiSlider);//TODO:

  return $E(
    'div',
    {
      key: 'pi-control-reverse-slider',
      piname: 'pi-control-reverse-slider',
      className: piSlider.piReverse
        ? `pi-slider-reverse ${cx(c.piSliderReverse)}`
        : '',
      // ref: '',
    },
    [piSliderRail, piSliderTrack, handleGroup, piSliderStep]
  );
}
function PiSliderHandle(
  handle: object,
  index: number,
  piSlider: PiSlider,
  marks: SliderMark[],
  emitAfterChange:(value:number|number[])=>void
) {
  const [showHandleTooltip, setShowHandleTooltip] = useState<boolean>(false); //TODO:
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
      onFocus:()=>changeFocus(true,piSlider.piDisabled,emitAfterChange),
      onBlur:()=>changeFocus(false,piSlider.piDisabled,emitAfterChange,piSlider.piModel.value,piSlider.piReverse)
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
      // ref: (r) => (this.refs.step = r),
      ref: (r) => {
        console.log(r);
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
