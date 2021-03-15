import {
  createTrackAndHandleMatcher,
  PiMarkType,
  PiModelWithMatcher,
  PiSlider,
  PiSliderDataInputType,
  PiValidRangeType,
  SliderMark,
} from './pi-slider-selector-data';
import * as L from 'lodash';

export function valueRatio(value: number, piMin: number, piMax: number) {
  const diff = Math.abs(piMax - piMin);
  return (Math.abs(value - Math.min(piMin, piMax)) / diff) * 100;
}
export function judgePiDataValid(value: PiSliderDataInputType) {
  if (value.piModel[0] > value.piModel[1])
    console.warn('piSlider: model[0]>model[1] please check');
  if (
    !L.isNil(value.piStep) &&
    (value.piStep <= 0 ||
      ((value.piMax - value.piMin) / value.piStep) % 1 !== 0)
  )
    throw Error(
      'piSlider: Step ,the value must be greater than 0 and divisible by (max - min)'
    );

  if (value.piModel[0] < value.piMin || value.piModel[1] > value.piMax)
    throw Error('piSlider: model value over range');
  if (
    value.piLengthBase &&
    value.piMax - value.piMin <
      value.piLengthBase.base * value.piLengthBase.minMul
  )
    throw Error(
      'piSlider: (piLengthBase.base *piLengthBase.minMul) cannot larger than (piMax - piMin),please check piLengthBase'
    );
}

export function createSliderStyle(
  piVertical: boolean,
  piReverse: boolean,
  piMin: number,
  piMax: number,
  piModel: PiModelWithMatcher,
  piMarks: PiMarkType,
  piValidRange: PiValidRangeType[]
): {
  track: object;
  handle: object[];
  marks: SliderMark[];
} {
  console.log('show style');
  function caculateTransformForHandle(position: string) {
    return `translate${['left', 'right'].includes(position) ? 'X' : 'Y'}(${
      ['left', 'top'].includes(position) ? '-' : ''
    }50%)`;
  }
  function caculateHandleIfValid(
    value: number,
    piValidRange: PiValidRangeType[]
  ) {
    if (L.isEmpty(piValidRange)) return {};
    const validRange = piValidRange.map((item) => {
      return [item.start.value, item.end.value].sort();
    });

    return L.isEmpty(
      validRange.filter((item) => item[0] <= value && item[1] >= value)
    )
      ? { border: 'solid 2px red' }
      : {};
  }
  const isRange = !L.isNumber(piModel.value);

  const modelSorted = !L.isNumber(piModel.value)
    ? (piModel.value as number[]).sort((a, b) => a - b)
    : piModel.value;
  console.log('piModel Sorted', isRange, modelSorted);
  if (piMin > piMax) {
    throw Error('slider max must larger than min...');
  }

  let style: {
    track: object;
    handle: object[];
    marks: SliderMark[];
  } = {
    track: {},
    handle: [],
    marks: [],
  };
  let position = piVertical ? ['bottom', 'top'] : ['left', 'right'];
  position = piReverse ? position.reverse() : position;
  console.log(piReverse, position[0]);
  const validMarks = L.isNil(piValidRange)
    ? []
    : piValidRange.map((item) => {
        return {
          [item.start.value]: {
            style: item.start.style,
            label: item.start.label,
          },
          [item.end.value]: {
            style: item.end.style,
            label: item.end.label,
          },
        };
      });
  const marksWithValid = Object.assign({}, piMarks, ...validMarks);
  console.log(marksWithValid);
  for (const key of [...Object.keys(marksWithValid)]) {
    const value = Number(key);
    if (
      marksWithValid.hasOwnProperty(key) &&
      value >= piMin &&
      value <= piMax
    ) {
      style.marks.push({
        dot: {
          [position[0]]: valueRatio(value, piMin, piMax) + '%',
        },
        isActive: isRange
          ? value >= modelSorted[0] && value <= modelSorted[1]
          : value >= piMin && value <= modelSorted,
        mark: {
          [position[0]]: valueRatio(value, piMin, piMax) + '%',
          transform: `translate${piVertical ? 'Y' : 'X'}(${
            L.isEqual(piReverse, piVertical) ? '-' : ''
          }50%)`,
          ...(L.isString(marksWithValid[key])
            ? {}
            : (marksWithValid[key].style as Object)),
        },
        value,
        ratio: valueRatio(value, piMin, piMax),
        label: L.isString(marksWithValid[key])
          ? marksWithValid[key]
          : marksWithValid[key].label,
      });
    }
  }
  Object.assign(
    style,
    piModel.match<{ track: object; handle: object[] }>(
      createTrackAndHandleMatcher(
        piMin,
        piMax,
        piVertical,
        position[0],
        (value: number) => caculateHandleIfValid(value, piValidRange),
        () => caculateTransformForHandle(position[0])
      )
    )
  );
  console.log(style);
  return style;
}
export function click(
  e: MouseEvent,
  step: HTMLElement,
  marks: SliderMark[],
  piSlider: PiSlider
): PiSlider {
  console.log(e);
  const piReverse = piSlider.piReverse;
  const piVertical = piSlider.piVertical;
  if (piSlider.piDisabled) return;
  const data = piVertical
    ? [e.offsetY, step.offsetTop, step.offsetHeight]
    : [e.offsetX, step.offsetLeft, step.offsetWidth];
  let withReverseOffset =
    piReverse === piVertical ? data[0] - data[1] : data[2] + data[1] - data[0];
  let currRatio = (withReverseOffset / data[2]) * 100;
  // this.clickStepS.next(() =>
  console.log(piSlider.freeClick(currRatio, marks, piSlider));
  return piSlider.freeClick(currRatio, marks, piSlider);
  // );
}

// export function mousedownTrack(event: MouseEvent, piSlider: PiSlider) {
//   if (
//     piSlider.piDisabled ||
//     L.isNumber(piSlider.piModel.value) ||
//     L.isNil(piSlider.piLengthBase)
//   )
//     return;
//   console.log('not prevent...');
//   this.mousedownTrackS.next({ event, piSlider: { ...piSlider } });
//   // console.log('mousedown track', event);
// }
interface ElementBoundaryAndSize {
  sliderTop: number;
  sliderLeft: number;
  height: number;
  width: number;
}
export function dragTrack(
  move: MouseEvent,
  down: {
    event: MouseEvent;
    piSlider: PiSlider;
  }
) {
  function caculateHandleOffset(
    e: MouseEvent,
    slider: ElementBoundaryAndSize,
    piReverse: boolean,
    piVertical: boolean
  ) {
    let offset = 0;
    const data = piVertical
      ? [e.pageY, slider.sliderTop, slider.height]
      : [e.pageX, slider.sliderLeft, slider.width];
    const reverseEqualVertical = piReverse === piVertical;
    offset = reverseEqualVertical
      ? data[0] - data[1]
      : data[2] + data[1] - data[0];
    if (data[0] > data[2] + data[1])
      offset = !reverseEqualVertical ? 0 : data[2];
    if (data[0] < data[1]) offset = !reverseEqualVertical ? data[2] : 0;
    return { offset, totalLength: data[2] };
  }

  function caculateDistance2Boundary(
    element: HTMLElement
  ): ElementBoundaryAndSize {
    //输出一个element到浏览器上边界和左边界的距离、高度、宽度
    const originElement = element;
    let sliderTop = 0;
    let sliderLeft = 0;
    if (!element) return { sliderTop, sliderLeft, height: 0, width: 0 };
    do {
      sliderTop += element.offsetTop;
      sliderLeft += element.offsetLeft;
      element = element.offsetParent as HTMLElement;
    } while (element);
    return {
      sliderTop,
      sliderLeft,
      height: originElement.offsetHeight,
      width: originElement.offsetWidth,
    };
  }
  console.log(down.piSlider);
  const originSlider = down.piSlider;
  const moveData = caculateHandleOffset(
    move,
    caculateDistance2Boundary(this.slider.nativeElement),
    down.piSlider.piReverse,
    down.piSlider.piVertical
  );
  const downData = caculateHandleOffset(
    down.event,
    caculateDistance2Boundary(this.slider.nativeElement),
    down.piSlider.piReverse,
    down.piSlider.piVertical
  );
  console.log(
    moveData.offset,
    downData.offset,
    down.piSlider.piModel,
    originSlider
  );
  const moveRatio = (downData.offset - moveData.offset) / moveData.totalLength;
  return down.piSlider.dragTrack(moveRatio, originSlider);
}
export function handle2Mark(
  event: Event,
  value: number,
  piSlider: PiSlider
): PiSlider {
  event.stopPropagation();
  if (piSlider.piDisabled) return;
  return piSlider.clickRailDot(value, piSlider);
}
export function changeFocus(
  value: boolean,
  piDisabled:boolean,
  emitAfterChange:(value: number | number[]) => void,
  modelValue?: number | number[],
  reverse?: boolean,){
    if (piDisabled) return;

    // this.focus$.next(value);

    if (!value && !L.isNil(modelValue))
     emitAfterChange(
        reverse && L.isArray(modelValue) ? (modelValue as number[]).reverse() : modelValue,
      );




}
