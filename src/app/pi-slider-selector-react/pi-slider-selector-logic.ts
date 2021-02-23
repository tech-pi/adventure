import {
  createTrackAndHandleMatcher,
  PiMarkType,
  PiModelWithMatcher,
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
          }50%);`,
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
