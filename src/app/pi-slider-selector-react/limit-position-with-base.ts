import { PiLengthBaseType, PiSliderDataInputType } from "./pi-slider-selector-data";
import * as L from 'lodash';

export function sortByReverse(arr: number[], isReverse: boolean | undefined) {
  return arr.sort((a, b) => (isReverse ? b - a : a - b));
}
export function updatePiPositionSliderReverseAndModel( //only use to update piReverse and piModel in piSliderData
  piSliderData: PiSliderDataInputType,
  reverse: boolean,
  value: number[],
) {
  return {
    ...piSliderData,
    piReverse: reverse,
    piModel: {
      ...piSliderData.piModel,
      value,
    },
  };
}
export function limitArrayFixed2(value: number[]) {
  return value.map((item) => L.round(item, 2));
}

export function limitPositionRangeByTrack(
  moveRatio: number, //moveRatio=downData.offset - moveData.offset) / totalLength
  step: number,
  originValue: number[],
  min: number,
  max: number,
) {
  originValue = limitArrayFixed2(originValue);
  let moveValue = moveRatio * (max - min);
  moveValue = Math.round(moveValue / step) * step;
  console.log(moveValue, originValue);
  const length = originValue[1] - originValue[0];
  let range = [originValue[0] - moveValue, originValue[1] - moveValue];
  console.log();
  console.log(range);
  if (range[1] > max) range = [max - length, max];
  if (range[0] < min) range = [min, min + length];
  console.warn(range);
  return range;
}
export function limitPositionRangeByHandle(
  type: 'min' | 'max',
  newValue: number,
  lengthBase: PiLengthBaseType,
  min: number,
  max: number,
  originData: number[],
): number[] {
  originData = limitArrayFixed2(originData);
  console.log(type, originData);
  let minLength = lengthBase.base * lengthBase.minMul;
  // let lengthMaxBoundary = max - min;
  if (type === 'min') {
    const newLength = originData[1] - newValue;
    minLength =
      Math.max(Math.round(newLength / lengthBase.base), lengthBase.minMul) *
      lengthBase.base;
    // if (minLength > lengthMaxBoundary) return [min, max];
    let newMin = L.round(originData[1] - minLength, 2);
    console.log('debug base...', newLength, newMin, newMin < min, min);
    if (newMin < min) newMin = min;
    return [newMin, newMin + minLength];
  }
  const newLength = newValue - originData[0];
  minLength =
    Math.max(Math.round(newLength / lengthBase.base), lengthBase.minMul) *
    lengthBase.base;
  // if (minLength > lengthMaxBoundary) return [min, max];
  let newMax = L.round(originData[0] + minLength, 2);
  console.log('debug base...', newLength, newMax, newMax > max, max);
  if (newMax > max) newMax = max;
  return [newMax - minLength, newMax];
}
export function limitPositionRangeByInput(
  type: 'min' | 'max',
  newValue: number,
  lengthBase: PiLengthBaseType,
  min: number,
  max: number,
  originData: number[],
) {
  originData = limitArrayFixed2(originData);

  console.log(type, originData);
  let minLength = lengthBase.base * lengthBase.minMul;
  let lengthMaxBoundary = max - min;
  if (type === 'min') {
    if (newValue > originData[1]) {
      return [originData[1] - minLength, originData[1]];
    }
    const newLength = originData[1] - newValue;

    minLength =
      Math.max(Math.round(newLength / lengthBase.base), lengthBase.minMul) *
      lengthBase.base;
    if (minLength > lengthMaxBoundary) return [min, max];
    let newMin = originData[1] - minLength;
    console.log('debug base...', newLength, newMin, newMin < min, min);
    if (newMin < min) newMin = min;
    return [newMin, newMin + minLength];
  }
  if (newValue < originData[0]) {
    return [originData[0], originData[0] + minLength];
  }
  const newLength = newValue - originData[0];
  minLength =
    Math.max(Math.round(newLength / lengthBase.base), lengthBase.minMul) *
    lengthBase.base;
  if (minLength > lengthMaxBoundary) return [min, max];
  let newMax = originData[0] + minLength;
  console.log('debug base...', newLength, newMax, newMax > max, max);
  if (newMax > max) newMax = max;
  return [newMax - minLength, newMax];
}
